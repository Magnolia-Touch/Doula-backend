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
exports.TestimonialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_util_1 = require("../common/utility/pagination.util");
let TestimonialsService = class TestimonialsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        const bookedservice = await this.prisma.serviceBooking.findFirst({
            where: { client: { userId: user.id }, servicePricingId: dto.serviceId }
        });
        if (!bookedservice) {
            throw new common_1.NotFoundException("No purchased service found for adding testimonial");
        }
        return this.prisma.testimonials.create({ data: { ...dto, clientId: user.id } });
    }
    async findAll(query) {
        const { doulaId, serviceId } = query;
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 10;
        const where = {};
        if (doulaId)
            where.doulaProfileId = doulaId;
        if (serviceId)
            where.servicePricingId = serviceId;
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.testimonials,
            page,
            limit,
            where,
            include: {
                DoulaProfile: {
                    include: {
                        user: { select: { name: true } }
                    }
                },
                ServicePricing: {
                    include: {
                        service: { select: { name: true } }
                    }
                },
                client: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        const formatted = result.data.map((item) => ({
            id: item.id,
            ratings: item.ratings,
            reviews: item.reviews,
            doulaName: item.DoulaProfile?.user?.name,
            serviceName: item.ServicePricing?.service?.name,
            clientName: item.client?.user?.name,
            createdAt: item.createdAt,
        }));
        return {
            data: formatted,
            meta: result.meta,
        };
    }
    async findOne(id, userId) {
        const testimonial = await this.prisma.testimonials.findUnique({
            where: { id },
            include: {
                DoulaProfile: {
                    include: { user: { select: { name: true } } }
                },
                ServicePricing: {
                    include: { service: { select: { name: true } } }
                },
                client: {
                    include: { user: { select: { name: true } } }
                }
            }
        });
        if (!testimonial) {
            throw new common_1.NotFoundException('Testimonial not found');
        }
        if (userId && testimonial.clientId !== userId) {
            throw new common_1.ForbiddenException('You are not allowed to modify this testimonial');
        }
        return {
            id: testimonial.id,
            ratings: testimonial.ratings,
            reviews: testimonial.reviews,
            doulaName: testimonial.DoulaProfile?.user?.name,
            serviceName: testimonial.ServicePricing?.service?.name,
            clientName: testimonial.client?.user?.name,
            createdAt: testimonial.createdAt,
        };
    }
    async update(id, dto, userId) {
        await this.findOne(id, userId);
        return this.prisma.testimonials.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        return this.prisma.testimonials.delete({
            where: { id },
        });
    }
    async getZoneManagerTestimonials(zoneManagerId, page = 1, limit = 10) {
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId: zoneManagerId },
            select: { id: true }
        });
        if (!zoneManager)
            return [];
        const doulas = await this.prisma.doulaProfile.findMany({
            where: {
                zoneManager: {
                    some: {
                        id: zoneManager.id
                    }
                }
            },
            select: { id: true }
        });
        const doulaIds = doulas.map(d => d.id);
        if (doulaIds.length === 0)
            return [];
        return await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.testimonials,
            page,
            limit,
            where: {
                doulaProfileId: { in: doulaIds }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                DoulaProfile: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                ServicePricing: {
                    include: {
                        service: {
                            select: { name: true }
                        }
                    }
                },
                client: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            }
        });
    }
};
exports.TestimonialsService = TestimonialsService;
exports.TestimonialsService = TestimonialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestimonialsService);
//# sourceMappingURL=testimonials.service.js.map