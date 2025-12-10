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
    async create(dto: CreateDoulaDto, userId: string, profileImageUrl?: string) {
        // Check if user already exists with this email
        checkUserExistorNot(this.prisma, dto.email);

        // Find the logged-in user
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        console.log(dto.regionIds)
        // Validate region IDs
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });

        if (regions.length !== dto.regionIds.length) {
            throw new NotFoundException("One or more region IDs are invalid");
        }

        // -------------------------------------------------------------
        // CASE 1: CREATED BY ZONE MANAGER
        // -------------------------------------------------------------
        if (user?.role === Role.ZONE_MANAGER) {
            const manager = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId }
            });

            const doula = await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    phone: dto.phone,
                    role: Role.DOULA,
                    doulaProfile: {
                        create: {
                            Region: {
                                connect: dto.regionIds.map(id => ({ id })),
                            },
                            zoneManager: {
                                connect: { id: manager?.id }
                            },
                            profileImage: profileImageUrl ?? null,
                            description: dto.description,
                            qualification: dto.qualification,
                            achievements: dto.achievements,
                            yoe: dto.yoe,
                            languages: dto.languages,

                        }
                    }
                },
                include: {
                    doulaProfile: {
                        include: {
                            zoneManager: true,
                        }
                    }
                }
            });

            return {
                message: 'Doula created successfully',
                data: doula
            };
        }

        // -------------------------------------------------------------
        // CASE 2: CREATED BY ADMIN
        // -------------------------------------------------------------
        if (user?.role === Role.ADMIN) {

            // Get regions & their zone managers
            const regions = await this.prisma.region.findMany({
                where: { id: { in: dto.regionIds } },
                select: {
                    id: true,
                    zoneManager: { select: { id: true } }
                }
            });

            // Validate region count again for safety
            if (regions.length !== dto.regionIds.length) {
                throw new BadRequestException("One or more regions are invalid.");
            }

            // Extract zone manager IDs
            const zoneManagerIds = regions
                .filter(r => r.zoneManager)
                .map(r => r.zoneManager!.id);

            if (zoneManagerIds.length === 0) {
                throw new BadRequestException(
                    "Selected regions must have a Zone Manager assigned."
                );
            }
            console.log("languages", dto.languages)

            // Create doula
            const doula = await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    phone: dto.phone,
                    role: Role.DOULA,
                    doulaProfile: {
                        create: {
                            Region: {
                                connect: dto.regionIds.map(id => ({ id })),
                            },
                            zoneManager: {
                                connect: zoneManagerIds.map(id => ({ id }))
                            },
                            profileImage: profileImageUrl ?? null,
                            description: dto.description,
                            qualification: dto.qualification,
                            achievements: dto.achievements,
                            yoe: dto.yoe,
                            languages: dto.languages
                        }
                    }
                },
                include: {
                    doulaProfile: {
                        include: {
                            zoneManager: true,
                        }
                    }
                }
            });

            return {
                message: 'Doula created successfully',
                data: doula
            };
        }

        // Fallback
        throw new BadRequestException("Unauthorized role");
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

        const where: any = {
            role: Role.DOULA,
        };

        // search filters
        if (search) {
            const q = search.toLowerCase();
            where.OR = [
                { name: { contains: q } },
                { email: { contains: q } },
                { phone: { contains: q } },
                {
                    doulaProfile: {
                        Region: {
                            some: { regionName: { contains: q } },
                        },
                    },
                },
                {
                    doulaProfile: {
                        zoneManager: {
                            some: {
                                user: { email: { contains: q } },
                            },
                        },
                    },
                },
            ];
        }

        // region filter
        if (regionName) {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                Region: {
                    some: {
                        regionName: {
                            contains: regionName.toLowerCase()
                        },
                    },
                },
            };
        }

        // minimum experience (yoe)
        if (typeof minExperience === 'number') {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                yoe: { gte: minExperience },
            };
        }

        // build ServicePricing filter conditions (merge both serviceId + serviceName)
        let servicePricingConditions: any = {};
        if (serviceId) {
            servicePricingConditions = {
                ...servicePricingConditions,
                serviceId,
            };
        }
        if (serviceName) {
            servicePricingConditions = {
                ...servicePricingConditions,
                service: {
                    name: {
                        contains: serviceName.toLowerCase()
                    },
                },
            };
        }
        if (Object.keys(servicePricingConditions).length > 0) {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                ServicePricing: { some: servicePricingConditions },
            };
        }

        // AvailableSlots date filters
        if (startDate || endDate) {
            const dateFilter: any = { isBooked: false, availabe: true };

            if (startDate) dateFilter.date = { gte: new Date(startDate) };
            if (endDate) {
                dateFilter.date = {
                    ...(dateFilter.date || {}),
                    lte: new Date(endDate),
                };
            }

            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                AvailableSlotsForService: { some: dateFilter },
            };
        }

        // active filter
        if (typeof isActive === 'boolean') {
            where.is_active = isActive;
        }

        // availability boolean filter
        if (typeof isAvailable === 'boolean') {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                AvailableSlotsForService: isAvailable
                    ? { some: { isBooked: false, availabe: true } }
                    : {},
            };
        }

        const result = await paginate({
            prismaModel: this.prisma.user,
            page,
            limit,
            where,
            include: {
                doulaProfile: {
                    include: {
                        Region: true,
                        ServicePricing: {
                            include: { service: true },
                        },

                        // fix: respect start/end date instead of forcing today
                        AvailableSlotsForService: {
                            where: {
                                availabe: true,
                                isBooked: false,
                                ...(startDate || endDate
                                    ? {
                                        date: {
                                            ...(startDate && { gte: new Date(startDate) }),
                                            ...(endDate && { lte: new Date(endDate) }),
                                        },
                                    }
                                    : {
                                        date: { gte: new Date() },
                                    }),
                            },
                            orderBy: { date: 'asc' },
                            take: 1,
                        },

                        Testimonials: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const items = result.data || [];

        const transformed = items.map((user: any) => {
            const profile = user.doulaProfile;

            const services =
                profile?.ServicePricing?.map((p) => p.service?.name).filter(Boolean) ?? [];

            const regions =
                profile?.Region?.map((r) => r.regionName).filter(Boolean) ?? [];

            const testimonials = profile?.Testimonials ?? [];
            const reviewCount = testimonials.length;

            const avgRating =
                reviewCount > 0
                    ? testimonials.reduce((sum, t) => sum + t.ratings, 0) / reviewCount
                    : null;

            const nextSlot = profile?.AvailableSlotsForService?.[0]?.date ?? null;

            return {
                userId: user.id,
                name: user.name,
                email: user.email,
                profileId: profile?.id ?? null,
                profileImage: profile?.profileImage ?? null,
                yoe: profile?.yoe ?? null,
                serviceNames: services,
                regionNames: regions,
                ratings: avgRating,
                reviewsCount: reviewCount,
                nextImmediateAvailabilityDate: nextSlot,
            };
        });

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
                            include: { service: true }
                        },
                        AvailableSlotsForService: {
                            where: {
                                availabe: true,
                                isBooked: false,
                                date: { gte: new Date() }
                            },
                            orderBy: { date: 'asc' },
                            take: 1,
                        },
                        Testimonials: {
                            include: {
                                client: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        },
                    },
                },
            },
        });

        if (!doula || doula.role !== Role.DOULA) {
            throw new NotFoundException('Doula not found');
        }

        const profile = doula.doulaProfile;

        const services =
            profile?.ServicePricing?.map((p) => p.service?.name).filter(Boolean) ?? [];

        const regions =
            profile?.Region?.map((r) => r.regionName).filter(Boolean) ?? [];

        const testimonials = profile?.Testimonials ?? [];
        const reviewsCount = testimonials.length;

        const avgRating =
            reviewsCount > 0
                ? testimonials.reduce((sum, t) => sum + t.ratings, 0) / reviewsCount
                : null;

        const nextSlot = profile?.AvailableSlotsForService?.[0]?.date ?? null;

        // Final formatted object
        const transformed = {
            userId: doula.id,
            name: doula.name,
            email: doula.email,

            profileId: profile?.id ?? null,
            profileImage: profile?.profileImage ?? null,
            yoe: profile?.yoe ?? null,

            description: profile?.description ?? null,
            achievements: profile?.achievements ?? null,
            qualification: profile?.qualification ?? null,

            serviceNames: services,
            regionNames: regions,

            ratings: avgRating,
            reviewsCount: reviewsCount,
            nextImmediateAvailabilityDate: nextSlot,

            testimonials: testimonials.map(t => ({
                id: t.id,
                rating: t.ratings,
                review: t.reviews,
                clientName: t.client?.user?.name ?? null,
                clientId: t.clientId,
                serviceId: t.serviceId,
                createdAt: t.createdAt
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
