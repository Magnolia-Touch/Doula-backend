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
const date_fns_1 = require("date-fns");
const date_fns_2 = require("date-fns");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listUsers(query) {
        const { role, is_active } = query;
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 10;
        const where = {};
        if (role)
            where.role = role;
        if (is_active !== undefined) {
            where.is_active = is_active;
        }
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
    async ActivecountUsersByRole() {
        const clients = await this.prisma.user.count({ where: { role: client_1.Role.CLIENT, is_active: true } });
        const doulas = await this.prisma.user.count({ where: { role: client_1.Role.DOULA, is_active: true } });
        const zonemanagers = await this.prisma.user.count({ where: { role: client_1.Role.ZONE_MANAGER, is_active: true } });
        const admins = await this.prisma.user.count({ where: { role: client_1.Role.ADMIN, is_active: true } });
        const total = await this.prisma.user.count();
        return {
            total,
            clients,
            doulas,
            zonemanagers,
            admins,
        };
    }
    async inactivecountUsersByRole() {
        const clients = await this.prisma.user.count({ where: { role: client_1.Role.CLIENT, is_active: false } });
        const doulas = await this.prisma.user.count({ where: { role: client_1.Role.DOULA, is_active: false } });
        const zonemanagers = await this.prisma.user.count({ where: { role: client_1.Role.ZONE_MANAGER, is_active: false } });
        const admins = await this.prisma.user.count({ where: { role: client_1.Role.ADMIN, is_active: false } });
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
        const totalBookings = await this.prisma.serviceBooking.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        const bookings = await this.prisma.serviceBooking.findMany({
            select: { paymentDetails: true },
        });
        let totalRevenue = 0;
        const FormattedCounts = {
            ACTIVE: 0,
            COMPLETED: 0,
            CANCELED: 0
        };
        totalBookings.forEach((item) => {
            FormattedCounts[item.status] = item._count.status;
        });
        return {
            FormattedCounts
        };
    }
    async getMeetingstats() {
        const totalMeetings = await this.prisma.meetings.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        const FormattedCounts = {
            SCHEDULED: 0,
            COMPLETED: 0,
            CANCELED: 0,
        };
        totalMeetings.forEach((item) => {
            FormattedCounts[item.status] = item._count.status;
        });
        return FormattedCounts;
    }
    async getDailyActivity(startDate, endDate) {
        let start;
        let end;
        if (startDate)
            start = (0, date_fns_2.startOfDay)(new Date(startDate));
        if (endDate)
            end = (0, date_fns_2.endOfDay)(new Date(endDate));
        const dateFilter = start && end ? { gte: start, lte: end }
            : start ? { gte: start }
                : end ? { lte: end }
                    : undefined;
        const bookings = await this.prisma.serviceBooking.findMany({
            where: {
                ...(dateFilter && { createdAt: dateFilter }),
            },
            select: { createdAt: true },
        });
        const meetings = await this.prisma.meetings.findMany({
            where: {
                ...(dateFilter && { createdAt: dateFilter }),
            },
            select: { createdAt: true },
        });
        const map = new Map();
        bookings.forEach((b) => {
            const date = (0, date_fns_1.format)(b.createdAt, 'yyyy-MM-dd');
            if (!map.has(date))
                map.set(date, { noOfBookings: 0, noOfMeetings: 0 });
            map.get(date).noOfBookings++;
        });
        meetings.forEach((m) => {
            const date = (0, date_fns_1.format)(m.createdAt, 'yyyy-MM-dd');
            if (!map.has(date))
                map.set(date, { noOfBookings: 0, noOfMeetings: 0 });
            map.get(date).noOfMeetings++;
        });
        const result = [];
        for (const [date, counts] of map.entries()) {
            const weekday = (0, date_fns_1.format)(new Date(date), 'EEE');
            result.push({
                date,
                weekday,
                noOfBookings: counts.noOfBookings,
                noOfMeetings: counts.noOfMeetings,
            });
        }
        result.sort((a, b) => a.date.localeCompare(b.date));
        return result;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map