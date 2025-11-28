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
exports.ZoneManagerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const pagination_util_1 = require("../common/utility/pagination.util");
const service_utils_1 = require("../common/utility/service-utils");
let ZoneManagerService = class ZoneManagerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });
        if (regions.length != dto.regionIds.length) {
            throw new common_1.NotFoundException("One or more region IDs are invalid");
        }
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const zoneManager = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: client_1.Role.ZONE_MANAGER,
                zonemanagerprofile: {
                    create: {
                        managingRegion: {
                            connect: dto.regionIds.map((id) => ({ id }))
                        }
                    },
                },
            },
            include: { zonemanagerprofile: true },
        });
        return { message: 'Zone Manager created successfully', data: zoneManager };
    }
    async get(page = 1, limit = 10, search) {
        const where = {
            role: client_1.Role.ZONE_MANAGER,
            OR: search
                ? [
                    { name: { contains: search.toLowerCase() } },
                    { email: { contains: search.toLowerCase() } },
                    { phone: { contains: search.toLowerCase() } },
                    {
                        zonemanagerprofile: {
                            managingRegion: {
                                some: {
                                    regionName: {
                                        contains: search.toLowerCase()
                                    }
                                }
                            }
                        },
                    },
                ]
                : undefined,
        };
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.user,
            page,
            limit,
            where,
            include: {
                zonemanagerprofile: {
                    include: { managingRegion: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return {
            message: 'Zone Managers fetched successfully',
            ...result,
        };
    }
    async getById(id) {
        const zoneManager = await this.prisma.user.findUnique({
            where: { id },
            include: { zonemanagerprofile: true },
        });
        if (!zoneManager || zoneManager.role !== client_1.Role.ZONE_MANAGER) {
            throw new common_1.NotFoundException('Zone Manager not found');
        }
        return { message: 'Zone Manager fetched successfully', data: zoneManager };
    }
    async delete(id) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== client_1.Role.ZONE_MANAGER) {
            throw new common_1.NotFoundException('Zone Manager not found');
        }
        await this.prisma.user.delete({ where: { id } });
        return { message: 'Zone Manager deleted successfully', data: null };
    }
    async updateStatus(id, isActive) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== client_1.Role.ZONE_MANAGER) {
            throw new common_1.NotFoundException('Zone Manager not found');
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                is_active: isActive,
            },
        });
        return { message: 'Zone Manager status updated successfully', data: updated };
    }
    async UpdateZoneManagerRegions(dto) {
        const a = (0, service_utils_1.findZoneManagerOrThrowWithId)(this.prisma, dto.profileId);
        console.log(a);
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });
        if (regions.length != dto.regionIds.length) {
            throw new common_1.NotFoundException("One or more region IDs are invalid");
        }
        if (dto.purpose == "add") {
            const data = await this.prisma.region.updateMany({
                where: { id: { in: dto.regionIds } },
                data: { zoneManagerId: dto.profileId }
            });
            return { message: `${data.count} Region(s) successfully assigned to Manager` };
        }
        else if (dto.purpose == "remove") {
            const data = await this.prisma.region.updateMany({
                where: { id: { in: dto.regionIds } },
                data: { zoneManagerId: null }
            });
            return { message: `${data.count} Region(s) successfully removed from Manager` };
        }
    }
    async regionAlreadyAssignedOrNot(regionIds) {
        const regions = await this.prisma.region.findMany({
            where: { id: { in: regionIds } },
            select: { id: true, regionName: true, zoneManagerId: true }
        });
        if (regions.length !== regionIds.length) {
            throw new common_1.NotFoundException("One or more region IDs are invalid");
        }
        const assigned = regions.filter(r => r.zoneManagerId !== null);
        const unassigned = regions.filter(r => r.zoneManagerId === null);
        return {
            message: "Region assignment status fetched",
            assignedCount: assigned.length,
            unassignedCount: unassigned.length,
            assigned,
            unassigned
        };
    }
};
exports.ZoneManagerService = ZoneManagerService;
exports.ZoneManagerService = ZoneManagerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZoneManagerService);
//# sourceMappingURL=zone_manager.service.js.map