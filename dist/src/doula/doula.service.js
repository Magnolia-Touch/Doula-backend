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
const service_utils_1 = require("../common/utility/service-utils");
let DoulaService = class DoulaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId, profileImageUrl) {
        (0, service_utils_1.checkUserExistorNot)(this.prisma, dto.email);
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        console.log(dto.regionIds);
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });
        if (regions.length !== dto.regionIds.length) {
            throw new common_1.NotFoundException("One or more region IDs are invalid");
        }
        if (user?.role === client_1.Role.ZONE_MANAGER) {
            const manager = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId }
            });
            const doula = await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    phone: dto.phone,
                    role: client_1.Role.DOULA,
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
                            languages: {
                                connect: dto.languages.map(lang => ({ id: lang })),
                            }
                        }
                    }
                },
                include: {
                    doulaProfile: {
                        include: {
                            zoneManager: true,
                            languages: true
                        }
                    }
                }
            });
            return {
                message: 'Doula created successfully',
                data: doula
            };
        }
        if (user?.role === client_1.Role.ADMIN) {
            const regions = await this.prisma.region.findMany({
                where: { id: { in: dto.regionIds } },
                select: {
                    id: true,
                    zoneManager: { select: { id: true } }
                }
            });
            if (regions.length !== dto.regionIds.length) {
                throw new common_1.BadRequestException("One or more regions are invalid.");
            }
            const zoneManagerIds = regions
                .filter(r => r.zoneManager)
                .map(r => r.zoneManager.id);
            if (zoneManagerIds.length === 0) {
                throw new common_1.BadRequestException("Selected regions must have a Zone Manager assigned.");
            }
            const doula = await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    phone: dto.phone,
                    role: client_1.Role.DOULA,
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
                            languages: {
                                connect: dto.languages.map(lang => ({ name: lang })),
                            }
                        }
                    }
                },
                include: {
                    doulaProfile: {
                        include: {
                            zoneManager: true,
                            languages: true
                        }
                    }
                }
            });
            return {
                message: 'Doula created successfully',
                data: doula
            };
        }
        throw new common_1.BadRequestException("Unauthorized role");
    }
    async get(page = 1, limit = 10, search, serviceId, isAvailable, isActive) {
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
                            some: {
                                regionName: { contains: q },
                            },
                        },
                    },
                },
                {
                    doulaProfile: {
                        zoneManager: {
                            some: {
                                user: {
                                    email: { contains: q },
                                },
                            },
                        },
                    },
                },
            ];
        }
        if (typeof isActive === 'boolean') {
            where.is_active = isActive;
        }
        if (serviceId) {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                ServicePricing: {
                    some: {
                        id: serviceId,
                    },
                },
            };
        }
        if (typeof isAvailable === 'boolean') {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                AvailableSlotsForService: isAvailable
                    ? {
                        some: {
                            isBooked: false,
                        },
                    }
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
                        zoneManager: {
                            include: {
                                user: true,
                            },
                        },
                        ServicePricing: true,
                        AvailableSlotsForService: true,
                        languages: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return {
            message: 'Doulas fetched successfully',
            ...result,
        };
    }
    async getById(id) {
        const doula = await this.prisma.user.findUnique({
            where: { id },
            include: { doulaProfile: { include: { languages: true } } },
        });
        if (!doula || doula.role !== client_1.Role.DOULA) {
            throw new common_1.NotFoundException('Doula not found');
        }
        return { message: 'Doula fetched successfully', data: doula };
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