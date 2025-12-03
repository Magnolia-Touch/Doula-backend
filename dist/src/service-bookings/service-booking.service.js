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
exports.ServiceBookingService = void 0;
const common_1 = require("@nestjs/common");
const pagination_util_1 = require("../common/utility/pagination.util");
const prisma_service_1 = require("../prisma/prisma.service");
let ServiceBookingService = class ServiceBookingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 10;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.serviceBooking,
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                DoulaProfile: true,
                service: true,
                client: true,
                region: true,
                slot: true,
                AvailableSlotsForService: true,
            },
        });
    }
    async findById(id) {
        const booking = await this.prisma.serviceBooking.findUnique({
            where: { id },
            include: {
                DoulaProfile: true,
                service: true,
                client: true,
                region: true,
                slot: true,
                AvailableSlotsForService: true,
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Service booking not found');
        }
        return booking;
    }
};
exports.ServiceBookingService = ServiceBookingService;
exports.ServiceBookingService = ServiceBookingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceBookingService);
//# sourceMappingURL=service-booking.service.js.map