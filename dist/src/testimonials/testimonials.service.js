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
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.testimonials,
            page,
            limit,
            where,
            include: {
                DoulaProfile: true,
                ServicePricing: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const testimonial = await this.prisma.testimonials.findUnique({
            where: { id },
        });
        if (!testimonial) {
            throw new common_1.NotFoundException('Testimonial not found');
        }
        if (userId && testimonial.clientId !== userId) {
            throw new common_1.ForbiddenException('You are not allowed to modify this testimonial');
        }
        return testimonial;
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
};
exports.TestimonialsService = TestimonialsService;
exports.TestimonialsService = TestimonialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestimonialsService);
//# sourceMappingURL=testimonials.service.js.map