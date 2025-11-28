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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_util_1 = require("../common/utility/pagination.util");
const client_1 = require("@prisma/client");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listUsers(query) {
        const { role } = query;
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 10;
        const where = {};
        if (role)
            where.role = role;
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.user,
            page,
            limit,
            where,
            include: {
                clientProfile: true,
                doulaProfile: true,
                zonemanagerprofile: true,
                adminProfile: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async countUsersByRole() {
        const clients = await this.prisma.user.count({ where: { role: client_1.Role.CLIENT } });
        const doulas = await this.prisma.user.count({ where: { role: client_1.Role.DOULA } });
        const zonemanagers = await this.prisma.user.count({ where: { role: client_1.Role.ZONE_MANAGER } });
        const admins = await this.prisma.user.count({ where: { role: client_1.Role.ADMIN } });
        const total = await this.prisma.user.count();
        return {
            total,
            clients,
            doulas,
            zonemanagers,
            admins,
        };
    }
    async getBookingStats() {
        const totalBookings = await this.prisma.serviceBooking.count();
        const bookings = await this.prisma.serviceBooking.findMany({
            select: { paymentDetails: true },
        });
        let totalRevenue = 0;
        return {
            totalBookings,
            totalRevenue,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map