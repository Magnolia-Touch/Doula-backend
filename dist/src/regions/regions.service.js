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
exports.RegionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_util_1 = require("../common/utility/pagination.util");
let RegionService = class RegionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.region.create({
            data: dto,
        });
    }
    async findAll(page = 1, limit = 10, search) {
        const where = search
            ? {
                OR: [
                    { regionName: { contains: search, mode: 'insensitive' } },
                    { district: { contains: search, mode: 'insensitive' } },
                    { state: { contains: search, mode: 'insensitive' } },
                    { country: { contains: search, mode: 'insensitive' } },
                ],
            }
            : undefined;
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.region,
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' },
        });
        const data = result.data.map((region) => ({
            regionId: region.id,
            regionName: region.regionName,
            pincode: region.pincode,
            district: region.district,
            state: region.state,
            country: region.country,
            latitude: region.latitude,
            longitude: region.longitude,
            is_active: region.is_active,
        }));
        return {
            message: 'Regions fetched successfully',
            data,
            meta: result.meta,
        };
    }
    async findOne(id) {
        const region = await this.prisma.region.findUnique({
            where: { id },
            include: {
                zoneManager: {
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
            },
        });
        if (!region) {
            throw new common_1.NotFoundException('Region not found');
        }
        return {
            regionId: region.id,
            regionName: region.regionName,
            pincode: region.pincode,
            district: region.district,
            state: region.state,
            country: region.country,
            latitude: region.latitude,
            longitude: region.longitude,
            zoneManagerId: region.zoneManager?.id ?? null,
            zonemanagerName: region.zoneManager?.user?.name ?? null,
            zonemanagerPhone: region.zoneManager?.user?.phone ?? null,
            zonemanagerEmail: region.zoneManager?.user?.email ?? null,
        };
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.region.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.region.delete({
            where: { id },
        });
    }
    async asignRegionToZoneManager() { }
    async updateRegionOfZoneManager() { }
    async removeRegionFromZoneManager() { }
};
exports.RegionService = RegionService;
exports.RegionService = RegionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegionService);
//# sourceMappingURL=regions.service.js.map