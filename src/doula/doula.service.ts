import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
// import { UpdateZoneManagerDto } from './dto/update-zone-manager.dto';
import { Role } from '@prisma/client';
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

}
