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
exports.AvailableSlotsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const service_utils_1 = require("../common/utility/service-utils");
const pagination_util_1 = require("../common/utility/pagination.util");
const client_1 = require("@prisma/client");
let AvailableSlotsService = class AvailableSlotsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAvailability(dto, user) {
        let profile;
        switch (user.role) {
            case client_1.Role.ZONE_MANAGER:
                profile = await this.prisma.zoneManagerProfile.findUnique({
                    where: { userId: user.id },
                });
                break;
            case client_1.Role.DOULA:
                profile = await this.prisma.doulaProfile.findUnique({
                    where: { userId: user.id },
                });
                break;
            case client_1.Role.ADMIN:
                profile = await this.prisma.adminProfile.findUnique({
                    where: { userId: user.id },
                });
                break;
            default:
                throw new common_1.ForbiddenException('Invalid user role');
        }
        const { weekday, startTime, endTime } = dto;
        const startDateTime = new Date(`${'1970-01-01'}T${startTime}:00`);
        const endDateTime = new Date(`${'1970-01-01'}T${endTime}:00`);
        if (startDateTime >= endDateTime) {
            throw new common_1.BadRequestException('Start time must be before end time.');
        }
        const dateslot = await (0, service_utils_1.getSlotOrCreateSlot)(this.prisma, weekday, user.role, profile.id);
        const timings = await this.prisma.availableSlotsTimeForMeeting.create({
            data: {
                dateId: dateslot.id,
                startTime: startDateTime,
                endTime: endDateTime,
                availabe: true,
                isBooked: false,
            },
        });
        console.log(dateslot);
        return {
            message: 'Slots created successfully',
            data: {
                weekday: dateslot.weekday,
                ownerRole: user.role,
                timeslot: {
                    startTime: timings.startTime,
                    endTime: timings.endTime,
                    available: timings.availabe,
                    is_booked: timings.isBooked,
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
        const availabilities = await this.prisma.availableSlotsForMeeting.findMany({
            where: whereClause,
            orderBy: { weekday: 'asc' },
            include: {
                AvailableSlotsTimeForMeeting: {
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
    async getAllSlots(regionId, startDate, endDate, filter = 'all', page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const firstDate = new Date(startDate);
        const secondDate = new Date(endDate);
        secondDate.setDate(secondDate.getDate() + 1);
        await (0, service_utils_1.findRegionOrThrow)(this.prisma, regionId);
        const region = await this.prisma.region.findUnique({
            where: { id: regionId },
            include: { zoneManager: true },
        });
        const manager = region?.zoneManagerId;
        const where = {
            zoneManagerId: manager,
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
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.availableSlotsForMeeting,
            page,
            limit,
            where,
            include: {
                AvailableSlotsTimeForMeeting: {
                    where: filter === 'all' ? undefined : timeFilter,
                    orderBy: { startTime: 'asc' },
                },
            },
            orderBy: { date: 'asc' },
        });
        const mapped = result.data.map((slot) => ({
            dateId: slot.id,
            weekday: slot.weekday,
            availabe: slot.availabe,
            ownerRole: slot.ownerRole,
            adminId: slot.adminId,
            doulaId: slot.doulaId,
            zoneManagerId: slot.zoneManagerId,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
            timings: slot.AvailableSlotsTimeForMeeting?.map((t) => ({
                timeId: t.id,
                startTime: t.startTime,
                endTime: t.endTime,
                availabe: t.availabe,
                isBooked: t.isBooked,
            })) || [],
        }));
        return {
            data: mapped,
            meta: result.meta,
        };
    }
    async getSlotById(id) {
        const slot = await this.prisma.availableSlotsForMeeting.findUnique({
            where: { id },
            include: {
                AvailableSlotsTimeForMeeting: {
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
    async updateSlotTimeById(dto, userId) {
        const role = await (0, service_utils_1.findUserRoleById)(this.prisma, userId);
        const timeSlot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: dto.timeSlotId },
            include: {
                date: true,
            },
        });
        if (!timeSlot)
            throw new common_1.NotFoundException('Time slot not found');
        const parentSlot = timeSlot.date;
        if (role === client_1.Role.ZONE_MANAGER) {
            const profile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (profile?.id !== parentSlot.zoneManagerId)
                throw new common_1.ForbiddenException("You cannot update another Zone Manager's slot");
        }
        if (role === client_1.Role.DOULA) {
            const profile = await this.prisma.doulaProfile.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (profile?.id !== parentSlot.doulaId)
                throw new common_1.ForbiddenException("You cannot update another Doula's slot");
        }
        if (role !== client_1.Role.ADMIN &&
            role !== client_1.Role.ZONE_MANAGER &&
            role !== client_1.Role.DOULA) {
            throw new common_1.BadRequestException('Authorization Failed');
        }
        const startDateTime = new Date(`${'1970-01-01'}T${dto.startTime}:00`);
        const endDateTime = new Date(`${'1970-01-01'}T${dto.endTime}:00`);
        const updatedTimeSlot = await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: dto.timeSlotId },
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
    async deleteSlots(slotId, userId) {
        const role = await (0, service_utils_1.findUserRoleById)(this.prisma, userId);
        const slot = await this.prisma.availableSlotsForMeeting.findUnique({
            where: { id: slotId },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Slot Not Found');
        }
        if (role === client_1.Role.ADMIN) {
            await this.prisma.availableSlotsForMeeting.delete({
                where: { id: slotId },
            });
            return {
                message: 'Slot Deleted Successfully',
                status: common_1.HttpStatus.NO_CONTENT,
            };
        }
        if (role === client_1.Role.ZONE_MANAGER) {
            const manager = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId },
            });
            if (slot.zoneManagerId !== manager?.id) {
                throw new common_1.ForbiddenException('You are not allowed to delete this slot');
            }
            await this.prisma.availableSlotsTimeForMeeting.deleteMany({
                where: { dateId: slotId },
            });
            await this.prisma.availableSlotsForMeeting.delete({
                where: { id: slotId },
            });
            return { message: 'Slot Deleted Successfully' };
        }
        if (role === client_1.Role.DOULA) {
            const doula = await this.prisma.doulaProfile.findUnique({
                where: { userId },
            });
            if (slot.doulaId !== doula?.id) {
                throw new common_1.ForbiddenException('You are not allowed to delete this slot');
            }
            await this.prisma.availableSlotsTimeForMeeting.deleteMany({
                where: { dateId: slotId },
            });
            await this.prisma.availableSlotsForMeeting.delete({
                where: { id: slotId },
            });
            return { message: 'Slot Deleted Successfully' };
        }
        throw new common_1.BadRequestException('Authorization failed');
    }
    async updateTimeSlotAvailability(id, booked, availabe) {
        const slot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: id },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Slot Not Found');
        }
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: id },
            data: {
                isBooked: false,
                availabe: true,
            },
        });
        return { message: 'Slot Updated Successfully' };
    }
    async findall(user, startDate, endDate, filter = 'all', page = 1, limit = 10) {
        let profile;
        let ownerField;
        switch (user.role) {
            case client_1.Role.ZONE_MANAGER:
                profile = await this.prisma.zoneManagerProfile.findUnique({
                    where: { userId: user.id },
                });
                ownerField = 'zoneManagerId';
                break;
            case client_1.Role.DOULA:
                profile = await this.prisma.doulaProfile.findUnique({
                    where: { userId: user.id },
                });
                ownerField = 'doulaId';
                break;
            case client_1.Role.ADMIN:
                profile = await this.prisma.adminProfile.findUnique({
                    where: { userId: user.id },
                });
                ownerField = 'adminId';
                break;
            default:
                throw new common_1.ForbiddenException('Invalid user role');
        }
        if (!profile) {
            throw new common_1.ForbiddenException('Profile not found for this user');
        }
        const skip = (page - 1) * limit;
        const firstDate = new Date(startDate);
        const secondDate = new Date(endDate);
        secondDate.setDate(secondDate.getDate() + 1);
        const where = {
            [ownerField]: profile.id,
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
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.availableSlotsForMeeting,
            page,
            limit,
            where,
            include: {
                AvailableSlotsTimeForMeeting: {
                    where: filter === 'all' ? undefined : timeFilter,
                    orderBy: { startTime: 'asc' },
                },
            },
            orderBy: { date: 'asc' },
        });
        const mapped = result.data.map((slot) => ({
            dateId: slot.id,
            weekday: slot.weekday,
            availabe: slot.availabe,
            ownerRole: slot.ownerRole,
            adminId: slot.adminId,
            doulaId: slot.doulaId,
            zoneManagerId: slot.zoneManagerId,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
            timings: slot.AvailableSlotsTimeForMeeting?.map((t) => ({
                timeId: t.id,
                startTime: t.startTime,
                endTime: t.endTime,
                availabe: t.availabe,
                isBooked: t.isBooked,
            })) || [],
        }));
        return {
            data: mapped,
            meta: result.meta,
        };
    }
};
exports.AvailableSlotsService = AvailableSlotsService;
exports.AvailableSlotsService = AvailableSlotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailableSlotsService);
//# sourceMappingURL=meetings-availability.service.js.map