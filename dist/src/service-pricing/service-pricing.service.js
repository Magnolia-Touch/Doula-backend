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
    toJsonPrice(price) {
        return {
            morning: price.morning,
            night: price.night,
            fullday: price.fullday,
        };
    }
    async create(dto, userId) {
        const user = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.servicePricing.create({
            data: {
                serviceId: dto.serviceId,
                doulaProfileId: user.id,
                price: this.toJsonPrice(dto.price),
            },
        });
    }
    async findAll(userId) {
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doula) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const pricingList = await this.prisma.servicePricing.findMany({
            where: { doulaProfileId: doula.id },
            orderBy: { createdAt: 'desc' },
            include: {
                DoulaProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                service: true,
            },
        });
        const data = pricingList.map((pricing) => ({
            servicePricingId: pricing.id,
            price: pricing.price,
            doulaProfileId: pricing.doulaProfileId,
            doulaName: pricing.DoulaProfile.user.name,
            doulaEmail: pricing.DoulaProfile.user.email,
            doulaPhone: pricing.DoulaProfile.user.phone,
            serviceId: pricing.service.id,
            serviceName: pricing.service.name,
            serviceDescription: pricing.service.description,
        }));
        return {
            message: 'Service pricing fetched successfully',
            data,
        };
    }
    async findOne(id) {
        const pricing = await this.prisma.servicePricing.findUnique({
            where: { id },
            include: {
                DoulaProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                service: true,
            },
        });
        if (!pricing) {
            throw new common_1.NotFoundException('Service pricing not found');
        }
        return {
            servicePricingId: pricing.id,
            price: pricing.price,
            doulaProfileId: pricing.doulaProfileId,
            doulaName: pricing.DoulaProfile.user.name,
            doulaEmail: pricing.DoulaProfile.user.email,
            doulaPhone: pricing.DoulaProfile.user.phone,
            serviceId: pricing.service.id,
            serviceName: pricing.service.name,
            serviceDescription: pricing.service.description,
        };
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.servicePricing.update({
            where: { id },
            data: {
                price: dto.price ? this.toJsonPrice(dto.price) : undefined,
            },
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
                    contains: name.toLowerCase(),
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