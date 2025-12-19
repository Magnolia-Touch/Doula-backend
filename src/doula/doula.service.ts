import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
// import { UpdateZoneManagerDto } from './dto/update-zone-manager.dto';
import { MeetingStatus, Prisma, Role } from '@prisma/client';
import { paginate } from 'src/common/utility/pagination.util';
import { checkUserExistorNot } from 'src/common/utility/service-utils';
import { UpdateDoulaRegionDto } from './dto/update-doula.dto';

@Injectable()
export class DoulaService {
    constructor(private prisma: PrismaService) { }

    // Create new Doula
    //if admin is creating doula, zone manager of regions are added to doulas profile.
    async create(
        dto: CreateDoulaDto,
        userId: string,
        images: {
            url: string;
            isMain: boolean;
            sortOrder: number;
        }[] = [],
    ) {
        // -----------------------------
        // Validate logged-in user
        // -----------------------------
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // -----------------------------
        // Validate regions
        // -----------------------------
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });

        if (regions.length !== dto.regionIds.length) {
            throw new NotFoundException('One or more region IDs are invalid');
        }

        // -----------------------------
        // Transaction starts
        // -----------------------------
        return await this.prisma.$transaction(async (tx) => {
            let createdUser;

            // =====================================================
            // CASE 1: ZONE MANAGER CREATES DOULA
            // =====================================================
            if (user.role === Role.ZONE_MANAGER) {
                const manager = await tx.zoneManagerProfile.findUnique({
                    where: { userId },
                });

                if (!manager) {
                    throw new BadRequestException(
                        'Zone Manager profile not found',
                    );
                }

                createdUser = await tx.user.create({
                    data: {
                        name: dto.name,
                        email: dto.email,
                        phone: dto.phone,
                        role: Role.DOULA,
                        doulaProfile: {
                            create: {
                                description: dto.description,
                                qualification: dto.qualification,
                                achievements: dto.achievements,
                                yoe: dto.yoe,
                                languages: dto.languages,

                                Region: {
                                    connect: dto.regionIds.map((id) => ({ id })),
                                },

                                zoneManager: {
                                    connect: { id: manager.id },
                                },

                                DoulaImages: {
                                    create: images,
                                },
                            },
                        },
                    },
                    include: {
                        doulaProfile: true,
                    },
                });
            }

            // =====================================================
            // CASE 2: ADMIN CREATES DOULA
            // =====================================================
            if (user.role === Role.ADMIN) {
                const regionsWithManagers = await tx.region.findMany({
                    where: { id: { in: dto.regionIds } },
                    select: {
                        zoneManager: {
                            select: { id: true },
                        },
                    },
                });

                const zoneManagerIds = regionsWithManagers
                    .filter((r) => r.zoneManager)
                    .map((r) => r.zoneManager!.id);

                if (!zoneManagerIds.length) {
                    throw new BadRequestException(
                        'Selected regions must have Zone Managers assigned',
                    );
                }

                createdUser = await tx.user.create({
                    data: {
                        name: dto.name,
                        email: dto.email,
                        phone: dto.phone,
                        role: Role.DOULA,
                        doulaProfile: {
                            create: {
                                description: dto.description,
                                qualification: dto.qualification,
                                achievements: dto.achievements,
                                yoe: dto.yoe,
                                languages: dto.languages,

                                Region: {
                                    connect: dto.regionIds.map((id) => ({ id })),
                                },

                                zoneManager: {
                                    connect: zoneManagerIds.map((id) => ({ id })),
                                },

                                DoulaImages: {
                                    create: images,
                                },
                            },
                        },
                    },
                    include: {
                        doulaProfile: true,
                    },
                });
            }

            if (!createdUser) {
                throw new BadRequestException('Unauthorized role');
            }

            // =====================================================
            // SERVICE PRICING CREATION
            // dto.services = { serviceId: price }
            // =====================================================
            if (dto.services) {
                await Promise.all(
                    Object.entries(dto.services).map(
                        ([serviceId, price]) =>
                            tx.servicePricing.create({
                                data: {
                                    doulaProfileId:
                                        createdUser.doulaProfile!.id,
                                    serviceId,
                                    price,
                                },
                            }),
                    ),
                );
            }

            // =====================================================
            // FINAL RESPONSE WITH RELATIONS
            // =====================================================
            const doulaWithDetails = await tx.user.findUnique({
                where: { id: createdUser.id },
                include: {
                    doulaProfile: {
                        include: {
                            DoulaImages: {
                                orderBy: { sortOrder: 'asc' },
                            },
                            ServicePricing: {
                                include: { service: true },
                            },
                            Region: true,
                            zoneManager: true,
                        },
                    },
                },
            });

            return {
                message: 'Doula created successfully',
                data: doulaWithDetails,
            };
        });
    }


    async get(
        page = 1,
        limit = 10,
        search?: string,
        serviceId?: string,
        isAvailable?: boolean,
        isActive?: boolean,
        regionName?: string,
        minExperience?: number,
        serviceName?: string,
        startDate?: string,
        endDate?: string,
    ) {
        /* ----------------------------------------------------
         * 1. Base user filter
         * -------------------------------------------------- */
        const where: any = {
            role: Role.DOULA,
        };

        /* ----------------------------------------------------
         * 2. Search filters
         * -------------------------------------------------- */
        if (search) {
            const q = search.toLowerCase();
            where.OR = [
                { name: { contains: q } },
                { email: { contains: q } },
                { phone: { contains: q } },
                {
                    doulaProfile: {
                        Region: { some: { regionName: { contains: q } } },
                    },
                },
            ];
        }

        /* ----------------------------------------------------
         * 3. Region filter
         * -------------------------------------------------- */
        if (regionName) {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                Region: {
                    some: { regionName: { contains: regionName.toLowerCase() } },
                },
            };
        }

        /* ----------------------------------------------------
         * 4. Minimum experience
         * -------------------------------------------------- */
        if (typeof minExperience === 'number') {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                yoe: { gte: minExperience },
            };
        }

        /* ----------------------------------------------------
         * 5. Service filters
         * -------------------------------------------------- */
        let servicePricingConditions: any = {};
        if (serviceId) servicePricingConditions.serviceId = serviceId;
        if (serviceName) {
            servicePricingConditions.service = {
                name: { contains: serviceName.toLowerCase() },
            };
        }

        if (Object.keys(servicePricingConditions).length) {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                ServicePricing: { some: servicePricingConditions },
            };
        }

        /* ----------------------------------------------------
         * 6. Active filter
         * -------------------------------------------------- */
        if (typeof isActive === 'boolean') {
            where.is_active = isActive;
        }

        /* ----------------------------------------------------
         * 7. Fetch doulas (NO date logic here)
         * -------------------------------------------------- */
        const result = await paginate({
            prismaModel: this.prisma.user,
            page,
            limit,
            where,
            include: {
                doulaProfile: {
                    include: {
                        Region: true,
                        ServicePricing: { include: { service: true } },
                        Testimonials: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const users = result.data ?? [];

        if (!users.length) {
            return {
                message: 'Doulas fetched successfully',
                ...result,
                data: [],
            };
        }

        /* ----------------------------------------------------
         * 8. Prepare date range
         * -------------------------------------------------- */
        const rangeStart = startDate ? new Date(startDate) : null;
        const rangeEnd = endDate ? new Date(endDate) : null;

        if (rangeStart) rangeStart.setHours(0, 0, 0, 0);
        if (rangeEnd) rangeEnd.setHours(0, 0, 0, 0);

        /* ----------------------------------------------------
         * 9. Fetch schedules for returned doulas
         * -------------------------------------------------- */
        const doulaProfileIds = users
            .map((u: any) => u.doulaProfile?.id)
            .filter(Boolean);

        const schedules = await this.prisma.schedules.findMany({
            where: {
                doulaProfileId: { in: doulaProfileIds },
                ...(rangeStart || rangeEnd
                    ? {
                        date: {
                            ...(rangeStart && { gte: rangeStart }),
                            ...(rangeEnd && { lte: rangeEnd }),
                        },
                    }
                    : {}),
            },
            select: {
                doulaProfileId: true,
                date: true,
            },
        });

        /* ----------------------------------------------------
         * 10. Build schedule lookup
         * -------------------------------------------------- */
        const scheduleMap = new Map<string, Date[]>();

        for (const s of schedules) {
            if (!scheduleMap.has(s.doulaProfileId)) {
                scheduleMap.set(s.doulaProfileId, []);
            }
            scheduleMap.get(s.doulaProfileId)!.push(s.date);
        }

        /* ----------------------------------------------------
         * 11. Transform response
         * -------------------------------------------------- */
        const transformed = users
            .map((user: any) => {
                const profile = user.doulaProfile;
                if (!profile) return null;

                const bookedDates = scheduleMap.get(profile.id) ?? [];

                const services =
                    profile.ServicePricing?.map(p => p.service?.name).filter(Boolean) ??
                    [];

                const regions =
                    profile.Region?.map(r => r.regionName).filter(Boolean) ?? [];

                const testimonials = profile.Testimonials ?? [];
                const reviewCount = testimonials.length;

                const avgRating =
                    reviewCount > 0
                        ? testimonials.reduce((s, t) => s + t.ratings, 0) / reviewCount
                        : null;

                const available =
                    rangeStart && rangeEnd
                        ? bookedDates.length === 0
                        : null;

                if (typeof isAvailable === 'boolean' && available !== isAvailable) {
                    return null;
                }

                return {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    profileId: profile.id,
                    profileImage: profile.profileImage ?? null,
                    yoe: profile.yoe ?? null,
                    serviceNames: services,
                    regionNames: regions,
                    ratings: avgRating,
                    reviewsCount: reviewCount,
                    isAvailable: available,
                    nextImmediateAvailabilityDate:
                        bookedDates.length ? bookedDates[0] : null,
                };
            })
            .filter(Boolean);

        return {
            message: 'Doulas fetched successfully',
            ...result,
            data: transformed,
        };
    }



    async getById(id: string) {
        const doula = await this.prisma.user.findUnique({
            where: { id },
            include: {
                doulaProfile: {
                    include: {
                        Region: true,
                        ServicePricing: {
                            include: { service: true },
                        },
                        AvailableSlotsForService: {
                            where: {
                                availabe: true,
                                isBooked: false,
                            },
                        },
                        Testimonials: {
                            include: {
                                client: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!doula || doula.role !== Role.DOULA) {
            throw new NotFoundException('Doula not found');
        }

        const profile = doula.doulaProfile;

        /* ----------------------------------------------------
         * Services & Regions
         * -------------------------------------------------- */
        const services =
            profile?.ServicePricing
                ?.map(p => p.service?.name)
                .filter(Boolean) ?? [];

        const regions =
            profile?.Region
                ?.map(r => r.regionName)
                .filter(Boolean) ?? [];

        /* ----------------------------------------------------
         * Ratings
         * -------------------------------------------------- */
        const testimonials = profile?.Testimonials ?? [];
        const reviewsCount = testimonials.length;

        const avgRating =
            reviewsCount > 0
                ? testimonials.reduce((sum, t) => sum + t.ratings, 0) / reviewsCount
                : null;

        /* ----------------------------------------------------
         * Next availability (computed from weekday)
         * -------------------------------------------------- */
        const today = new Date();
        const todayIndex = today.getDay(); // 0 (Sun) - 6 (Sat)

        const weekdayOrder: Record<string, number> = {
            SUNDAY: 0,
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
        };

        const availableWeekdays =
            profile?.AvailableSlotsForService?.map(s => weekdayOrder[s.weekday]) ?? [];

        const nextImmediateAvailabilityDate =
            availableWeekdays.length > 0
                ? new Date(
                    today.setDate(
                        today.getDate() +
                        Math.min(
                            ...availableWeekdays.map(d =>
                                d >= todayIndex ? d - todayIndex : 7 - todayIndex + d,
                            ),
                        ),
                    ),
                )
                : null;

        /* ----------------------------------------------------
         * Final Response
         * -------------------------------------------------- */
        const transformed = {
            userId: doula.id,
            name: doula.name,
            email: doula.email,

            profileId: profile?.id ?? null,
            yoe: profile?.yoe ?? null,

            description: profile?.description ?? null,
            achievements: profile?.achievements ?? null,
            qualification: profile?.qualification ?? null,

            serviceNames: services,
            regionNames: regions,

            ratings: avgRating,
            reviewsCount,

            nextImmediateAvailabilityDate,

            testimonials: testimonials.map(t => ({
                id: t.id,
                rating: t.ratings,
                review: t.reviews,
                clientName: t.client?.user?.name ?? null,
                clientId: t.clientId,
                serviceId: t.serviceId,
                createdAt: t.createdAt,
            })),
        };

        return {
            message: 'Doula fetched successfully',
            data: transformed,
        };
    }



    async delete(id: string) {
        // 1. find user
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
            include: { doulaProfile: true }
        });

        if (!existingUser || existingUser.role !== Role.DOULA) {
            throw new NotFoundException('Doula not found');
        }

        // 2. delete DoulaProfile first
        if (existingUser.doulaProfile) {
            await this.prisma.doulaProfile.delete({
                where: { userId: existingUser.id },
            });
        }

        // 3. delete User
        await this.prisma.user.delete({
            where: { id },
        });

        return { message: 'Doula deleted successfully', data: null };
    }



    async updateStatus(id: string, isActive: boolean) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== Role.DOULA) {
            throw new NotFoundException('Doula not found');
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                is_active: isActive,
            },
        });

        return { message: 'Doula status updated successfully', data: updated };
    }


    async UpdateDoulaRegions(dto: UpdateDoulaRegionDto, userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        // Validate doula
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { id: dto.profileId },
            include: { zoneManager: true, Region: true },
        });
        if (!doula) throw new NotFoundException("Doula does not exist");

        // Fetch regions with their managers
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
            select: { id: true, zoneManager: { select: { id: true } } }
        });
        if (regions.length !== dto.regionIds.length)
            throw new NotFoundException("One or more region IDs are invalid");

        // ---------------------- ZONE MANAGER FLOW ----------------------
        if (user?.role === Role.ZONE_MANAGER) {
            const zn = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId }
            });
            if (!zn) throw new NotFoundException("Zone Manager profile not found");

            // Check that every region belongs to this zone manager
            const unauthorized = regions.some(r => r.zoneManager?.id !== zn.id);
            if (unauthorized) {
                throw new BadRequestException(
                    "You cannot assign regions that are not managed by you."
                );
            }

            // Apply add/remove
            const update = await this.prisma.doulaProfile.update({
                where: { id: dto.profileId },
                data: {
                    Region: {
                        [dto.purpose === "add" ? "connect" : "disconnect"]:
                            dto.regionIds.map(id => ({ id })),
                    },
                    ...(dto.purpose === "add"
                        ? { zoneManager: { connect: { id: zn.id } } }
                        : {} // removing does not detach zone manager
                    ),
                },
                include: { Region: true, zoneManager: true },
            });

            return {
                message: `Regions ${dto.purpose === "add" ? "added" : "removed"} successfully`,
                data: update,
            };
        }

        // --------------------------- ADMIN FLOW ---------------------------
        if (user?.role === Role.ADMIN) {
            if (dto.purpose === "add") {
                const zoneManagerIds = regions
                    .map(r => r.zoneManager?.id)
                    .filter(id => id);

                if (zoneManagerIds.length !== regions.length)
                    throw new BadRequestException("All selected regions must have a Zone Manager assigned");

                const update = await this.prisma.doulaProfile.update({
                    where: { id: dto.profileId },
                    data: {
                        Region: {
                            connect: dto.regionIds.map(id => ({ id }))
                        },
                        zoneManager: {
                            connect: zoneManagerIds.map(id => ({ id }))
                        }
                    },
                    include: { Region: true, zoneManager: true },
                });

                return { message: "Regions added successfully", data: update };
            }

            if (dto.purpose === "remove") {
                const update = await this.prisma.doulaProfile.update({
                    where: { id: dto.profileId },
                    data: {
                        Region: {
                            disconnect: dto.regionIds.map(id => ({ id }))
                        }
                    },
                    include: { Region: true, zoneManager: true },
                });

                return { message: "Regions removed successfully", data: update };
            }
        }

        throw new BadRequestException("Invalid purpose");
    }

    async getDoulaMeetings(
        user: any,
        page = 1,
        limit = 10,
        date?: string,
    ) {
        if (user.role !== Role.DOULA) {
            throw new ForbiddenException('Access denied');
        }

        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!doulaProfile) {
            throw new ForbiddenException('Doula profile not found');
        }

        const where: any = {
            doulaProfileId: doulaProfile.id,
        };

        // ✅ Apply date filter only if date param exists
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            where.date = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        const result = await paginate({
            prismaModel: this.prisma.meetings,
            page,
            limit,
            where,
            include: {
                bookedBy: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        type DoulaMeetingWithClient =
            Prisma.MeetingsGetPayload<{
                include: {
                    bookedBy: {
                        include: {
                            user: {
                                select: {
                                    name: true;
                                };
                            };
                        };
                    };
                };
            }>;

        const meetings = result.data as DoulaMeetingWithClient[];

        return {
            success: true,
            message: 'Doula meetings fetched successfully',
            data: meetings.map((meeting) => ({
                date: meeting.date,
                serviceName: meeting.serviceName,
                clientName: meeting.bookedBy.user.name,
            })),
            meta: result.meta,
        };
    }



    async getDoulaSchedules(
        user: any,
        page = 1,
        limit = 10,
        date?: string,
    ) {
        if (user.role !== Role.DOULA) {
            throw new ForbiddenException('Access denied');
        }

        // Fetch doula profile
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!doulaProfile) {
            throw new ForbiddenException('Doula profile not found');
        }

        const where: any = {
            doulaProfileId: doulaProfile.id,
        };

        // ✅ Optional date filter (Schedules.date is @db.Date)
        if (date) {
            where.date = new Date(date);
        }

        const result = await paginate({
            prismaModel: this.prisma.schedules,
            page,
            limit,
            where,
            include: {
                ServicePricing: {
                    include: {
                        service: {
                            select: { name: true },
                        },
                    },
                },
                client: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        type DoulaScheduleWithRelations =
            Prisma.SchedulesGetPayload<{
                include: {
                    ServicePricing: {
                        include: {
                            service: {
                                select: { name: true };
                            };
                        };
                    };
                    client: {
                        include: {
                            user: {
                                select: { name: true };
                            };
                        };
                    };
                };
            }>;

        const schedules = result.data as DoulaScheduleWithRelations[];

        return {
            success: true,
            message: 'Doula schedules fetched successfully',
            data: schedules.map((schedule) => ({
                date: schedule.date,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                serviceName: schedule.ServicePricing.service.name,
                clientName: schedule.client.user.name,
            })),
            meta: result.meta,
        };
    }

    async getDoulaScheduleCount(user: any) {
        if (user.role !== Role.DOULA) {
            throw new ForbiddenException('Access denied');
        }

        // Get Doula profile
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!doulaProfile) {
            throw new ForbiddenException('Doula profile not found');
        }

        /** -----------------------------
         * Date calculations
         * ----------------------------- */

        // Today (Schedules.date is @db.Date)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start of week (Monday)
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay(); // 0 = Sunday
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);

        // End of week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        /** -----------------------------
         * Counts
         * ----------------------------- */

        const [todayCount, weeklyCount] = await Promise.all([
            // Today's schedules
            this.prisma.schedules.count({
                where: {
                    doulaProfileId: doulaProfile.id,
                    date: today,
                },
            }),

            // Weekly schedules
            this.prisma.schedules.count({
                where: {
                    doulaProfileId: doulaProfile.id,
                    date: {
                        gte: startOfWeek,
                        lte: endOfWeek,
                    },
                },
            }),
        ]);

        return {
            success: true,
            message: 'Doula schedule counts fetched successfully',
            data: {
                today: todayCount,
                thisWeek: weeklyCount,
            },
        };
    }


    async ImmediateMeeting(user: any) {
        if (user.role !== Role.DOULA) {
            throw new ForbiddenException('Access denied');
        }

        // Fetch doula profile
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!doulaProfile) {
            throw new ForbiddenException('Doula profile not found');
        }

        const now = new Date();

        // Fetch next upcoming meeting
        const meeting = await this.prisma.meetings.findFirst({
            where: {
                doulaProfileId: doulaProfile.id,
                status: MeetingStatus.SCHEDULED, // adjust if needed
                OR: [
                    {
                        date: { gt: now },
                    },
                    {
                        date: now,
                        startTime: { gte: now },
                    },
                ],
            },
            include: {
                bookedBy: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
                Service: {
                    select: { name: true },
                },
            },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' },
            ],
        });

        if (!meeting) {
            return {
                success: true,
                message: 'No upcoming meetings',
                data: null,
            };
        }

        // Calculate time remaining
        const meetingDateTime = new Date(meeting.date);
        meetingDateTime.setHours(
            meeting.startTime.getHours(),
            meeting.startTime.getMinutes(),
            0,
            0,
        );

        const diffMs = meetingDateTime.getTime() - now.getTime();
        const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

        return {
            success: true,
            message: 'Immediate meeting fetched successfully',
            data: {
                clientName: meeting.bookedBy.user.name,
                serviceName: meeting.Service?.name ?? meeting.serviceName,
                startTime: meeting.startTime,
                timeToStart: `in ${diffMinutes} mins`,
                meetingLink: meeting.link,
            },
        };
    }


    async getDoulaRatingSummary(user: any) {
        if (user.role !== Role.DOULA) {
            throw new ForbiddenException('Access denied');
        }

        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!doulaProfile) {
            throw new ForbiddenException('Doula profile not found');
        }

        // Fetch all ratings for this doula
        const testimonials = await this.prisma.testimonials.findMany({
            where: {
                doulaProfileId: doulaProfile.id,
            },
            select: {
                ratings: true,
            },
        });

        const totalReviews = testimonials.length;

        if (totalReviews === 0) {
            return {
                success: true,
                message: 'No reviews yet',
                data: {
                    averageRating: 0,
                    totalReviews: 0,
                    distribution: {
                        5: 0,
                        4: 0,
                        3: 0,
                        2: 0,
                        1: 0,
                    },
                },
            };
        }

        // Initialize distribution
        const distribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };

        let ratingSum = 0;

        for (const t of testimonials) {
            distribution[t.ratings]++;
            ratingSum += t.ratings;
        }

        const averageRating = Number((ratingSum / totalReviews).toFixed(1));

        return {
            success: true,
            message: 'Doula rating summary fetched successfully',
            data: {
                averageRating,
                totalReviews,
                distribution,
            },
        };
    }

    async getDoulaTestimonials(
        user: any,
        page = 1,
        limit = 10,
    ) {
        if (user.role !== Role.DOULA) {
            throw new ForbiddenException('Access denied');
        }

        // Fetch doula profile
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!doulaProfile) {
            throw new ForbiddenException('Doula profile not found');
        }

        const result = await paginate({
            prismaModel: this.prisma.testimonials,
            page,
            limit,
            where: {
                doulaProfileId: doulaProfile.id,
            },
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                ServicePricing: {
                    include: {
                        service: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        type DoulaTestimonialWithRelations =
            Prisma.TestimonialsGetPayload<{
                include: {
                    client: {
                        include: {
                            user: {
                                select: {
                                    id: true;
                                    name: true;
                                    email: true;
                                    phone: true;
                                };
                            };
                        };
                    };
                    ServicePricing: {
                        include: {
                            service: {
                                select: {
                                    name: true;
                                };
                            };
                        };
                    };
                };
            }>;

        const testimonials = result.data as DoulaTestimonialWithRelations[];

        return {
            success: true,
            message: 'Doula testimonials fetched successfully',
            data: testimonials.map((t) => ({
                clientId: t.client.user.id,
                clientName: t.client.user.name,
                email: t.client.user.email,
                phone: t.client.user.phone,
                ratings: t.ratings,
                reviews: t.reviews,
                createdAt: t.createdAt,
                serviceName: t.ServicePricing.service.name,
                servicePricingId: t.ServicePricing.id,
            })),
            meta: result.meta,
        };
    }


    async doulaProfile(user: any) {
        if (user.role !== Role.DOULA) {
            throw new ForbiddenException('Access denied');
        }

        const doula = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                Region: {
                    select: {
                        regionName: true,
                    },
                },
                Testimonials: {
                    select: {
                        ratings: true,
                    },
                },
                DoulaGallery: {
                    select: {
                        id: true,
                        url: true,
                        altText: true,
                    },
                },
            },
        });

        if (!doula) {
            throw new NotFoundException('Doula profile not found');
        }

        /** -----------------------
         * Rating calculations
         * ---------------------- */
        const totalReviews = doula.Testimonials.length;
        const ratingSum = doula.Testimonials.reduce(
            (sum, r) => sum + r.ratings,
            0,
        );

        const averageRating =
            totalReviews > 0
                ? Number((ratingSum / totalReviews).toFixed(1))
                : 0;

        const satisfaction =
            totalReviews > 0
                ? Math.round((ratingSum / (totalReviews * 5)) * 100)
                : 0;

        /** -----------------------
         * Response
         * ---------------------- */
        return {
            success: true,
            message: 'Doula profile fetched successfully',
            data: {
                id: doula.id,

                // Header
                name: doula.user.name,
                title: 'Certified Birth Doula',
                averageRating,
                totalReviews,

                // Stats
                births: 0, // optional: derive from ServiceBooking
                experience: doula.yoe ?? 0,
                satisfaction,

                // Contact
                contact: {
                    email: doula.user.email,
                    phone: doula.user.phone,
                    location: doula.Region?.[0]?.regionName ?? null,
                },

                // About
                about: doula.description,

                // Certifications
                certifications: [
                    ...(doula.qualification
                        ? doula.qualification.split(',').map((q) => q.trim())
                        : []),
                    ...(doula.achievements
                        ? doula.achievements.split(',').map((a) => a.trim())
                        : []),
                ],

                // Gallery
                gallery: doula.DoulaGallery.map((img) => ({
                    id: img.id,
                    url: img.url,
                    altText: img.altText,
                })),
            },
        };
    }


    //take start and end date. and mark unavavailble for that particular range.
    //update doula booking to look on that before booking doulas.
    async blockDateRange() { }






}
