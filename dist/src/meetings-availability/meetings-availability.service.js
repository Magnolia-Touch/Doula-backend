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
const date_fns_1 = require("date-fns");
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
                    where: { userId: user.id }
                });
                break;
            case client_1.Role.DOULA:
                profile = await this.prisma.doulaProfile.findUnique({
                    where: { userId: user.id }
                });
                break;
            case client_1.Role.ADMIN:
                profile = await this.prisma.adminProfile.findUnique({
                    where: { userId: user.id }
                });
                break;
            default:
                throw new common_1.ForbiddenException("Invalid user role");
        }
        const { date, startTime, endTime } = dto;
        const slotDate = new Date(date);
        const weekday = (0, date_fns_1.format)(slotDate, "EEEE");
        console.log(weekday);
        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);
        if (startDateTime >= endDateTime) {
            throw new common_1.BadRequestException("Start time must be before end time.");
        }
        const dateslot = await (0, service_utils_1.getSlotOrCreateSlot)(this.prisma, dto.date, user.role, profile.id);
        const timings = await this.prisma.availableSlotsTimeForMeeting.create({
            data: {
                dateId: dateslot.id,
                startTime: startDateTime,
                endTime: endDateTime,
                availabe: true,
                isBooked: false,
            }
        });
        console.log(dateslot);
        return {
            message: "Slots created successfully",
            data: {
                date: dateslot.date,
                ownerRole: user.role,
                timeslot: {
                    startTime: timings.startTime,
                    endTime: timings.endTime,
                    available: timings.availabe,
                    is_booked: timings.isBooked
                }
            }
        };
    }
    async getAllSlots(regionId, startDate, endDate, filter = 'all', page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const firstDate = new Date(startDate);
        const secondDate = new Date(endDate);
        secondDate.setDate(secondDate.getDate() + 1);
        await (0, service_utils_1.findRegionOrThrow)(this.prisma, regionId);
        const region = await this.prisma.region.findUnique({
            where: { id: regionId },
            include: { zoneManager: true }
        });
        const manager = region?.zoneManagerId;
        const where = {
            zoneManagerId: manager,
            date: {
                gte: firstDate,
                lt: secondDate,
            }
        };
        const timeFilter = {};
        if (filter === 'booked')
            timeFilter.isBooked = true;
        if (filter === 'unbooked')
            timeFilter.isBooked = false;
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.availableSlotsForMeeting,
            page,
            limit,
            where,
            include: {
                AvailableSlotsTimeForMeeting: {
                    where: filter === 'all' ? undefined : timeFilter,
                    orderBy: { startTime: 'asc' }
                }
            },
            orderBy: { date: 'asc' }
        });
    }
    async getSlotById(id) {
        const slot = await this.prisma.availableSlotsForMeeting.findUnique({
            where: { id },
            include: {
                AvailableSlotsTimeForMeeting: {
                    orderBy: { startTime: 'asc' }
                }
            }
        });
        if (!slot) {
            throw new common_1.NotFoundException("Slot not found");
        }
        return {
            message: "Slot retrieved successfully",
            slot,
        };
    }
    async updateSlotTimeById(dto, userId) {
        const role = await (0, service_utils_1.findUserRoleById)(this.prisma, userId);
        const timeSlot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: dto.timeSlotId },
            include: {
                date: true,
            }
        });
        if (!timeSlot)
            throw new common_1.NotFoundException("Time slot not found");
        const parentSlot = timeSlot.date;
        if (role === client_1.Role.ZONE_MANAGER) {
            const profile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId },
                select: { id: true }
            });
            if (profile?.id !== parentSlot.zoneManagerId)
                throw new common_1.ForbiddenException("You cannot update another Zone Manager's slot");
        }
        if (role === client_1.Role.DOULA) {
            const profile = await this.prisma.doulaProfile.findUnique({
                where: { userId },
                select: { id: true }
            });
            if (profile?.id !== parentSlot.doulaId)
                throw new common_1.ForbiddenException("You cannot update another Doula's slot");
        }
        if (role !== client_1.Role.ADMIN && role !== client_1.Role.ZONE_MANAGER && role !== client_1.Role.DOULA) {
            throw new common_1.BadRequestException("Authorization Failed");
        }
        const startDateTime = new Date(`${parentSlot.date.toISOString().split("T")[0]}T${dto.startTime}:00`);
        const endDateTime = new Date(`${parentSlot.date.toISOString().split("T")[0]}T${dto.endTime}:00`);
        const updatedTimeSlot = await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: dto.timeSlotId },
            data: {
                startTime: startDateTime,
                endTime: endDateTime
            }
        });
        return {
            message: "Time slot updated successfully",
            data: updatedTimeSlot
        };
    }
    async deleteSlots(slotId, userId) {
        const role = await (0, service_utils_1.findUserRoleById)(this.prisma, userId);
        const slot = await this.prisma.availableSlotsForMeeting.findUnique({
            where: { id: slotId },
        });
        if (!slot) {
            throw new common_1.NotFoundException("Slot Not Found");
        }
        if (role === client_1.Role.ADMIN) {
            await this.prisma.availableSlotsForMeeting.delete({
                where: { id: slotId },
            });
            return { message: "Slot Deleted Successfully", status: common_1.HttpStatus.NO_CONTENT };
        }
        if (role === client_1.Role.ZONE_MANAGER) {
            const manager = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId },
            });
            if (slot.zoneManagerId !== manager?.id) {
                throw new common_1.ForbiddenException("You are not allowed to delete this slot");
            }
            await this.prisma.availableSlotsTimeForMeeting.deleteMany({
                where: { dateId: slotId }
            });
            await this.prisma.availableSlotsForMeeting.delete({
                where: { id: slotId },
            });
            return { message: "Slot Deleted Successfully" };
        }
        if (role === client_1.Role.DOULA) {
            const doula = await this.prisma.doulaProfile.findUnique({
                where: { userId },
            });
            if (slot.doulaId !== doula?.id) {
                throw new common_1.ForbiddenException("You are not allowed to delete this slot");
            }
            await this.prisma.availableSlotsTimeForMeeting.deleteMany({
                where: { dateId: slotId }
            });
            await this.prisma.availableSlotsForMeeting.delete({
                where: { id: slotId },
            });
            return { message: "Slot Deleted Successfully" };
        }
        throw new common_1.BadRequestException("Authorization failed");
    }
    async updateTimeSlotAvailability(id, booked, availabe) {
        const slot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: id },
        });
        if (!slot) {
            throw new common_1.NotFoundException("Slot Not Found");
        }
        ;
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: id },
            data: {
                isBooked: false,
                availabe: true
            }
        });
        return { message: "Slot Updated Successfully" };
    }
};
exports.AvailableSlotsService = AvailableSlotsService;
exports.AvailableSlotsService = AvailableSlotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailableSlotsService);
//# sourceMappingURL=meetings-availability.service.js.map