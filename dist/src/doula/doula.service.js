"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoulaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const pagination_util_1 = require("../common/utility/pagination.util");
let DoulaService = class DoulaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId, images = []) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });
        if (regions.length !== dto.regionIds.length) {
            throw new common_1.NotFoundException('One or more region IDs are invalid');
        }
        return await this.prisma.$transaction(async (tx) => {
            let createdUser;
            if (user.role === client_1.Role.ZONE_MANAGER) {
                const manager = await tx.zoneManagerProfile.findUnique({
                    where: { userId },
                });
                if (!manager) {
                    throw new common_1.BadRequestException('Zone Manager profile not found');
                }
                createdUser = await tx.user.create({
                    data: {
                        name: dto.name,
                        email: dto.email,
                        phone: dto.phone,
                        role: client_1.Role.DOULA,
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
            if (user.role === client_1.Role.ADMIN) {
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
                    .map((r) => r.zoneManager.id);
                if (!zoneManagerIds.length) {
                    throw new common_1.BadRequestException('Selected regions must have Zone Managers assigned');
                }
                createdUser = await tx.user.create({
                    data: {
                        name: dto.name,
                        email: dto.email,
                        phone: dto.phone,
                        role: client_1.Role.DOULA,
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
                throw new common_1.BadRequestException('Unauthorized role');
            }
            if (dto.services) {
                await Promise.all(Object.entries(dto.services).map(([serviceId, price]) => tx.servicePricing.create({
                    data: {
                        doulaProfileId: createdUser.doulaProfile.id,
                        serviceId,
                        price,
                    },
                })));
            }
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
    async get(page = 1, limit = 10, search, serviceId, isAvailable, isActive, regionName, minExperience, serviceName, startDate, endDate) {
        const where = {
            role: client_1.Role.DOULA,
        };
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
        if (typeof minExperience === 'number') {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                yoe: { gte: minExperience },
            };
        }
        let servicePricingConditions = {};
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
        if (startDate || endDate) {
            const dateFilter = { isBooked: false, availabe: true };
            if (startDate)
                dateFilter.date = { gte: new Date(startDate) };
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
        if (typeof isActive === 'boolean') {
            where.is_active = isActive;
        }
        if (typeof isAvailable === 'boolean') {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                AvailableSlotsForService: isAvailable
                    ? { some: { isBooked: false, availabe: true } }
                    : {},
            };
        }
        const result = await (0, pagination_util_1.paginate)({
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
        const transformed = items.map((user) => {
            const profile = user.doulaProfile;
            const services = profile?.ServicePricing?.map((p) => p.service?.name).filter(Boolean) ?? [];
            const regions = profile?.Region?.map((r) => r.regionName).filter(Boolean) ?? [];
            const testimonials = profile?.Testimonials ?? [];
            const reviewCount = testimonials.length;
            const avgRating = reviewCount > 0
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
    async getById(id) {
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
        if (!doula || doula.role !== client_1.Role.DOULA) {
            throw new common_1.NotFoundException('Doula not found');
        }
        const profile = doula.doulaProfile;
        const services = profile?.ServicePricing?.map((p) => p.service?.name).filter(Boolean) ?? [];
        const regions = profile?.Region?.map((r) => r.regionName).filter(Boolean) ?? [];
        const testimonials = profile?.Testimonials ?? [];
        const reviewsCount = testimonials.length;
        const avgRating = reviewsCount > 0
            ? testimonials.reduce((sum, t) => sum + t.ratings, 0) / reviewsCount
            : null;
        const nextSlot = profile?.AvailableSlotsForService?.[0]?.date ?? null;
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
    async delete(id) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
            include: { doulaProfile: true }
        });
        if (!existingUser || existingUser.role !== client_1.Role.DOULA) {
            throw new common_1.NotFoundException('Doula not found');
        }
        if (existingUser.doulaProfile) {
            await this.prisma.doulaProfile.delete({
                where: { userId: existingUser.id },
            });
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'Doula deleted successfully', data: null };
    }
    async updateStatus(id, isActive) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== client_1.Role.DOULA) {
            throw new common_1.NotFoundException('Doula not found');
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                is_active: isActive,
            },
        });
        return { message: 'Doula status updated successfully', data: updated };
    }
    async UpdateDoulaRegions(dto, userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { id: dto.profileId },
            include: { zoneManager: true, Region: true },
        });
        if (!doula)
            throw new common_1.NotFoundException("Doula does not exist");
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
            select: { id: true, zoneManager: { select: { id: true } } }
        });
        if (regions.length !== dto.regionIds.length)
            throw new common_1.NotFoundException("One or more region IDs are invalid");
        if (user?.role === client_1.Role.ZONE_MANAGER) {
            const zn = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId }
            });
            if (!zn)
                throw new common_1.NotFoundException("Zone Manager profile not found");
            const unauthorized = regions.some(r => r.zoneManager?.id !== zn.id);
            if (unauthorized) {
                throw new common_1.BadRequestException("You cannot assign regions that are not managed by you.");
            }
            const update = await this.prisma.doulaProfile.update({
                where: { id: dto.profileId },
                data: {
                    Region: {
                        [dto.purpose === "add" ? "connect" : "disconnect"]: dto.regionIds.map(id => ({ id })),
                    },
                    ...(dto.purpose === "add"
                        ? { zoneManager: { connect: { id: zn.id } } }
                        : {}),
                },
                include: { Region: true, zoneManager: true },
            });
            return {
                message: `Regions ${dto.purpose === "add" ? "added" : "removed"} successfully`,
                data: update,
            };
        }
        if (user?.role === client_1.Role.ADMIN) {
            if (dto.purpose === "add") {
                const zoneManagerIds = regions
                    .map(r => r.zoneManager?.id)
                    .filter(id => id);
                if (zoneManagerIds.length !== regions.length)
                    throw new common_1.BadRequestException("All selected regions must have a Zone Manager assigned");
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
        throw new common_1.BadRequestException("Invalid purpose");
    }
};
exports.DoulaService = DoulaService;
exports.DoulaService = DoulaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoulaService);
//# sourceMappingURL=doula.service.js.map