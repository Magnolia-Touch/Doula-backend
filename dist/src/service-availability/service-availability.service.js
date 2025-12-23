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
exports.DoulaServiceAvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_util_1 = require("../common/utility/pagination.util");
const client_1 = require("@prisma/client");
const service_utils_1 = require("../common/utility/service-utils");
let DoulaServiceAvailabilityService = class DoulaServiceAvailabilityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAvailability(dto, user) {
        let profile;
        profile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
        });
        const { weekday, startTime, endTime } = dto;
        const startDateTime = new Date(`${'1970-01-01'}T${startTime}:00`);
        const endDateTime = new Date(`${'1970-01-01'}T${endTime}:00`);
        if (startDateTime >= endDateTime) {
            throw new common_1.BadRequestException('Start time must be before end time.');
        }
        const dateslot = await (0, service_utils_1.getServiceSlotOrCreateSlot)(this.prisma, dto.weekday, profile.id);
        const timings = await this.prisma.availableSlotsTimeForService.create({
            data: {
                dateId: dateslot.id,
                startTime: startDateTime,
                endTime: endDateTime,
                availabe: true,
            },
        });
        console.log(dateslot);
        return {
            message: 'Service Slots created successfully',
            data: {
                date: dateslot.weekday,
                ownerRole: user.role,
                timeslot: {
                    startTime: timings.startTime,
                    endTime: timings.endTime,
                    available: timings.availabe,
                },
            },
        };
    }
    async getMyAvailabilities(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const whereClause = {};
        if (user.role === client_1.Role.DOULA) {
            const doulaProfile = await this.prisma.doulaProfile.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (!doulaProfile) {
                throw new common_1.NotFoundException('Doula profile not found');
            }
            whereClause.doulaId = doulaProfile.id;
        }
        else if (user.role === client_1.Role.ZONE_MANAGER) {
            const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (!zoneManagerProfile) {
                throw new common_1.NotFoundException('Zone Manager profile not found');
            }
            whereClause.zoneManagerId = zoneManagerProfile.id;
        }
        else {
            throw new common_1.ForbiddenException('This role has no availability');
        }
        const availabilities = await this.prisma.availableSlotsForService.findMany({
            where: whereClause,
            orderBy: { weekday: 'asc' },
            include: {
                AvailableSlotsTimeForService: {
                    orderBy: { startTime: 'asc' },
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        availabe: true,
                        isBooked: true,
                    },
                },
            },
        });
        return availabilities;
    }
    async getAllSlots(doulaId, startDate, endDate, filter = 'all', page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const firstDate = new Date(startDate);
        const secondDate = new Date(endDate);
        secondDate.setDate(secondDate.getDate() + 1);
        const doula = await (0, service_utils_1.findDoulaOrThrowWithId)(this.prisma, doulaId);
        const where = {
            doulaId: doula.id,
            date: {
                gte: firstDate,
                lt: secondDate,
            },
        };
        const timeFilter = {};
        if (filter === 'booked')
            timeFilter.isBooked = true;
        if (filter === 'unbooked')
            timeFilter.isBooked = false;
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.availableSlotsForService,
            page,
            limit,
            where,
            include: {
                AvailableSlotsTimeForService: {
                    where: filter === 'all' ? undefined : timeFilter,
                    orderBy: { startTime: 'asc' },
                },
            },
            orderBy: { date: 'asc' },
        });
    }
    async getSlotById(id) {
        const slot = await this.prisma.availableSlotsForService.findUnique({
            where: { id },
            include: {
                AvailableSlotsTimeForService: {
                    orderBy: { startTime: 'asc' },
                },
            },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Slot not found');
        }
        return {
            message: 'Slot retrieved successfully',
            slot,
        };
    }
    async updateSlotTimeById(dto, timeSlotId, userId) {
        const timeSlot = await this.prisma.availableSlotsTimeForService.findUnique({
            where: { id: timeSlotId, date: { doula: { userId: userId } } },
            include: {
                date: true,
            },
        });
        if (!timeSlot)
            throw new common_1.NotFoundException('Time slot not found');
        const parentSlot = timeSlot.date;
        const startDateTime = new Date(`${'1970-01-01'}T${dto.startTime}:00`);
        const endDateTime = new Date(`${'1970-01-01'}T${dto.endTime}:00`);
        const updatedTimeSlot = await this.prisma.availableSlotsTimeForService.update({
            where: { id: timeSlotId },
            data: {
                startTime: startDateTime,
                endTime: endDateTime,
            },
        });
        return {
            message: 'Time slot updated successfully',
            data: updatedTimeSlot,
        };
    }
    async deleteSlots(timeSlotId, userId) {
        const timeSlot = await this.prisma.availableSlotsTimeForService.findUnique({
            where: { id: timeSlotId, date: { doula: { userId: userId } } },
            include: {
                date: true,
            },
        });
        if (!timeSlot)
            throw new common_1.NotFoundException('Time slot not found');
        const deletedTimeSlot = await this.prisma.availableSlotsTimeForService.delete({
            where: { id: timeSlotId },
        });
        return {
            message: 'Time slot Deleted successfully',
            data: deletedTimeSlot,
        };
    }
    async updateSlotTimeByDate(timeSlotId) {
        const timeSlot = await this.prisma.availableSlotsForService.findUnique({
            where: { id: timeSlotId },
        });
        if (!timeSlot)
            throw new common_1.NotFoundException('Time slot not found');
        const updatedslot = await this.prisma.availableSlotsForService.update({
            where: { id: timeSlotId },
            data: {
                availabe: true,
                isBooked: false,
            },
        });
        await this.prisma.availableSlotsTimeForService.updateMany({
            where: { id: timeSlotId },
            data: {
                availabe: true,
            },
        });
        return {
            message: 'Slot updated successfully',
            data: updatedslot,
        };
    }
};
exports.DoulaServiceAvailabilityService = DoulaServiceAvailabilityService;
exports.DoulaServiceAvailabilityService = DoulaServiceAvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoulaServiceAvailabilityService);
//# sourceMappingURL=service-availability.service.js.map