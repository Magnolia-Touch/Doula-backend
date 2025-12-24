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
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.serviceBooking,
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                DoulaProfile: {
                    include: {
                        user: true,
                    },
                },
                client: {
                    include: {
                        user: true,
                    },
                },
                service: {
                    include: {
                        service: true,
                    },
                },
                region: true,
                slot: true,
                AvailableSlotsForService: true,
            },
        });
        const items = result.data || [];
        const transformed = items.map((b) => {
            const clientUser = b.client?.user;
            const doulaUser = b.DoulaProfile?.user;
            const serviceName = b.service?.service?.name ?? null;
            const startDate = b.date;
            const endDate = b.date;
            const timeSlots = b.slot?.map((s) => ({
                id: s.id,
                startTime: s.startTime,
                endTime: s.endTime,
            })) ?? [];
            return {
                bookingId: b.id,
                clientUserId: clientUser?.id ?? null,
                clientName: clientUser?.name ?? null,
                clientProfileId: b.client?.id ?? null,
                doulaUserId: doulaUser?.id ?? null,
                doulaName: doulaUser?.name ?? null,
                doulaProfileId: b.DoulaProfile?.id ?? null,
                regionName: b.region?.regionName ?? null,
                serviceName,
                start_date: startDate,
                end_date: endDate,
                timeSlots,
                status: b.status,
                createdAt: b.createdAt,
            };
        });
        return {
            message: 'Bookings fetched successfully',
            ...result,
            data: transformed,
        };
    }
    async findById(id) {
        const booking = await this.prisma.serviceBooking.findUnique({
            where: { id },
            include: {
                DoulaProfile: {
                    include: {
                        user: true,
                    },
                },
                client: {
                    include: {
                        user: true,
                    },
                },
                service: {
                    include: {
                        service: true,
                    },
                },
                region: true,
                slot: true,
                AvailableSlotsForService: true,
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Service booking not found');
        }
        const clientUser = booking.client?.user;
        const doulaUser = booking.DoulaProfile?.user;
        const serviceName = booking.service?.service?.name ?? null;
        const startDate = booking.startDate;
        const endDate = booking.endDate;
        const timeSlots = booking.slot?.map((s) => ({
            id: s.id,
            startTime: s.startTime,
            endTime: s.endTime,
        })) ?? [];
        const transformed = {
            bookingId: booking.id,
            clientUserId: clientUser?.id ?? null,
            clientName: clientUser?.name ?? null,
            clientProfileId: booking.client?.id ?? null,
            doulaUserId: doulaUser?.id ?? null,
            doulaName: doulaUser?.name ?? null,
            doulaProfileId: booking.DoulaProfile?.id ?? null,
            regionName: booking.region?.regionName ?? null,
            serviceName,
            start_date: startDate,
            end_date: endDate,
            timeSlots,
            status: booking.status,
            createdAt: booking.createdAt,
        };
        return {
            message: 'Booking fetched successfully',
            data: transformed,
        };
    }
    async updateScheduleStatus(userId, scheduleId, dto) {
        const { status } = dto;
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const schedule = await this.prisma.schedules.findFirst({
            where: {
                id: scheduleId,
                doulaProfileId: doulaProfile.id,
            },
        });
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        const updatedSchedule = await this.prisma.schedules.update({
            where: { id: scheduleId },
            data: { status },
        });
        return {
            message: 'Schedule status updated successfully',
            scheduleId: updatedSchedule.id,
            status: updatedSchedule.status,
        };
    }
    async updateBookingStatus(userId, bookingId, dto) {
        const { status } = dto;
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const schedule = await this.prisma.serviceBooking.findFirst({
            where: {
                id: bookingId,
                doulaProfileId: doulaProfile.id,
            },
        });
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        const updatedSchedule = await this.prisma.serviceBooking.update({
            where: { id: bookingId },
            data: { status },
        });
        return {
            message: 'Booking status updated successfully',
            scheduleId: updatedSchedule.id,
            status: updatedSchedule.status,
        };
    }
};
exports.ServiceBookingService = ServiceBookingService;
exports.ServiceBookingService = ServiceBookingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceBookingService);
//# sourceMappingURL=service-booking.service.js.map