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
exports.ServicePricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_util_1 = require("../common/utility/pagination.util");
let ServicePricingService = class ServicePricingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const user = await this.prisma.doulaProfile.findUnique({
            where: { userId: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException("User Not found Exception");
        }
        return this.prisma.servicePricing.create({
            data: {
                serviceId: dto.serviceId,
                doulaProfileId: user.id,
                price: dto.price
            }
        });
    }
    async findAll(userId) {
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { userId: userId }
        });
        if (!doula) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        return this.prisma.servicePricing.findMany({
            where: { doulaProfileId: doula.id },
            orderBy: { createdAt: 'desc' },
            include: {
                DoulaProfile: true,
                service: true
            }
        });
    }
    async findOne(id) {
        const service = await this.prisma.servicePricing.findUnique({
            where: { id },
            include: {
                DoulaProfile: true,
                service: true
            }
        });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return service;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.servicePricing.update({
            where: { id: id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.servicePricing.delete({
            where: { id },
        });
    }
    async listServices(query) {
        const { name, doulaId, page = 1, limit = 10 } = query;
        const where = {};
        if (name) {
            where.service = {
                name: {
                    contains: name.toLowerCase()
                },
            };
        }
        if (doulaId) {
            where.doulaProfileId = doulaId;
        }
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.servicePricing,
            page: Number(page),
            limit: Number(limit),
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                DoulaProfile: true,
                service: true,
            },
        });
    }
};
exports.ServicePricingService = ServicePricingService;
exports.ServicePricingService = ServicePricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicePricingService);
//# sourceMappingURL=service-pricing.service.js.map