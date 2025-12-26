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
const availability_time_resolver_util_1 = require("./availability-time-resolver.util");
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
        const dateSlot = await (0, service_utils_1.getSlotOrCreateSlot)(this.prisma, weekday, user.role, profile.id);
        const existingSlots = await this.prisma.availableSlotsTimeForMeeting.findMany({
            where: {
                dateId: dateSlot.id,
                availabe: true,
                isBooked: false,
            },
            select: {
                startTime: true,
                endTime: true,
            },
        });
        console.log("inputs", startTime, endTime, "\n existing slot", existingSlots);
        const result = (0, availability_time_resolver_util_1.resolveAvailabilityOverlap)({ startTime, endTime }, existingSlots);
        console.log("result", result);
        if (result === 0) {
            throw new common_1.BadRequestException('Availability fully overlaps an existing slot');
        }
        if (result === 1) {
            throw new common_1.BadRequestException('Availability partially overlaps an existing slot');
        }
        const startDateTime = new Date(`1970-01-01T${result.startTime}:00`);
        const endDateTime = new Date(`1970-01-01T${result.endTime}:00`);
        if (startDateTime >= endDateTime) {
            throw new common_1.BadRequestException('Invalid availability after adjustment');
        }
        return {
            message: 'Slots created successfully',
            data: {
                weekday: dateSlot.weekday,
                ownerRole: user.role,
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
    async markOffDays(user, dto) {
        const { startDate, endDate, startTime, endTime } = dto;
        const startTimeObj = new Date(`1970-01-01T${startTime}:00`);
        const endTimeObj = new Date(`1970-01-01T${endTime}:00`);
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : null;
        start.setHours(0, 0, 0, 0);
        end?.setHours(0, 0, 0, 0);
        if (user.role === client_1.Role.DOULA) {
            const doula = await this.prisma.doulaProfile.findUnique({
                where: { userId: user.id },
                select: { id: true }
            });
            if (!doula) {
                throw new common_1.NotFoundException('Doula not found');
            }
            console.log(doula.id, "doulaid");
            if (!end) {
                return this.prisma.offDays.create({
                    data: {
                        date: start,
                        startTime: startTimeObj,
                        endTime: endTimeObj,
                        doulaProfileId: doula.id,
                    },
                });
            }
            const offDaysData = [];
            const current = new Date(start);
            while (current <= end) {
                offDaysData.push({
                    date: new Date(current),
                    startTime: startTimeObj,
                    endTime: endTimeObj,
                    doulaProfileId: doula.id,
                });
                current.setDate(current.getDate() + 1);
            }
            return this.prisma.offDays.createMany({
                data: offDaysData,
            });
        }
        if (user.role === client_1.Role.ZONE_MANAGER) {
            const zm = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
            });
            if (!zm) {
                throw new common_1.NotFoundException('Zone Manager not found');
            }
            if (!end) {
                return this.prisma.offDays.create({
                    data: {
                        date: start,
                        startTime: startTimeObj,
                        endTime: endTimeObj,
                        zoneManagerProfileId: zm.id,
                    },
                });
            }
            const offDaysData = [];
            const current = new Date(start);
            while (current <= end) {
                offDaysData.push({
                    date: new Date(current),
                    startTime: startTimeObj,
                    endTime: endTimeObj,
                    zoneManagerProfileId: zm.id,
                });
                current.setDate(current.getDate() + 1);
            }
            return this.prisma.offDays.createMany({
                data: offDaysData,
            });
        }
    }
    async fetchOffdays(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const offdays = await this.prisma.offDays.findMany({
            where: {
                date: { gte: today },
                OR: [
                    { DoulaProfile: { userId: userId } },
                    { ZoneManagerProfile: { userId: userId } }
                ]
            },
            orderBy: {
                date: "asc"
            }
        });
        return offdays;
    }
    async fetchOffdaysbyid(userId, id) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const offdays = await this.prisma.offDays.findFirst({
            where: {
                id: id,
                OR: [
                    { DoulaProfile: { userId: userId } },
                    { ZoneManagerProfile: { userId: userId } }
                ]
            },
            orderBy: {
                date: "asc"
            }
        });
        return offdays;
    }
    async DeleteOffdaysbyid(userId, id) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const offdays = await this.prisma.offDays.delete({
            where: {
                id: id,
                OR: [
                    { DoulaProfile: { userId: userId } },
                    { ZoneManagerProfile: { userId: userId } }
                ]
            },
        });
        return { message: "Off days Deleted Successfully", data: offdays };
    }
    getWeekdayEnum(date) {
        const map = [
            client_1.WeekDays.SUNDAY,
            client_1.WeekDays.MONDAY,
            client_1.WeekDays.TUESDAY,
            client_1.WeekDays.WEDNESDAY,
            client_1.WeekDays.THURSDAY,
            client_1.WeekDays.FRIDAY,
            client_1.WeekDays.SATURDAY,
        ];
        return map[date.getDay()];
    }
    isOverlapping(startA, endA, startB, endB) {
        if (!startB || !endB)
            return true;
        return startA < endB && endA > startB;
    }
    formatTimeOnly(date) {
        return date.toISOString().substring(11, 19);
    }
    async ZmgetAvailablility(userId, dto) {
        const { date1, date2, weekday } = dto;
        if (!date1) {
            throw new common_1.BadRequestException('date1 is required');
        }
        if (weekday && !date2) {
            throw new common_1.BadRequestException('date2 is required when weekday filter is used');
        }
        const startDate = new Date(date1);
        const endDate = date2 ? new Date(date2) : startDate;
        if (startDate > endDate) {
            throw new common_1.BadRequestException('date1 cannot be after date2');
        }
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!zoneManager) {
            throw new common_1.ForbiddenException('Zone manager profile not found');
        }
        const dates = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        const filteredDates = weekday
            ? dates.filter((d) => this.getWeekdayEnum(d) === weekday)
            : dates;
        const weekdays = [
            ...new Set(filteredDates.map((d) => this.getWeekdayEnum(d))),
        ];
        const weeklySlots = await this.prisma.availableSlotsForMeeting.findMany({
            where: {
                zoneManagerId: zoneManager.id,
                weekday: { in: weekdays },
                availabe: true,
            },
            include: {
                AvailableSlotsTimeForMeeting: {
                    where: {
                        availabe: true,
                        isBooked: false,
                    },
                },
            },
        });
        const meetings = await this.prisma.meetings.findMany({
            where: {
                zoneManagerProfileId: zoneManager.id,
                date: {
                    in: filteredDates,
                },
            },
        });
        const offDays = await this.prisma.offDays.findMany({
            where: {
                zoneManagerProfileId: zoneManager.id,
                date: {
                    in: filteredDates,
                },
            },
        });
        const response = filteredDates.map((date) => {
            const weekdayEnum = this.getWeekdayEnum(date);
            const weeklySlot = weeklySlots.find((s) => s.weekday === weekdayEnum);
            if (!weeklySlot) {
                return {
                    date,
                    weekday: weekdayEnum,
                    timeslots: [],
                };
            }
            let slots = weeklySlot.AvailableSlotsTimeForMeeting.map((t) => ({
                startTime: t.startTime,
                endTime: t.endTime,
            }));
            const dayMeetings = meetings.filter((m) => m.date.toDateString() === date.toDateString());
            slots = slots.filter((slot) => !dayMeetings.some((m) => this.isOverlapping(slot.startTime, slot.endTime, m.startTime, m.endTime)));
            const dayOff = offDays.find((o) => o.date.toDateString() === date.toDateString());
            if (dayOff) {
                if (!dayOff.startTime && !dayOff.endTime) {
                    slots = [];
                }
                else {
                    slots = slots.filter((slot) => !this.isOverlapping(slot.startTime, slot.endTime, dayOff.startTime ?? undefined, dayOff.endTime ?? undefined));
                }
            }
            return {
                date,
                weekday: weekdayEnum,
                timeslots: slots.map((slot) => ({
                    startTime: this.formatTimeOnly(slot.startTime),
                    endTime: this.formatTimeOnly(slot.endTime),
                }))
            };
        });
        return response;
    }
};
exports.AvailableSlotsService = AvailableSlotsService;
exports.AvailableSlotsService = AvailableSlotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailableSlotsService);
//# sourceMappingURL=meetings-availability.service.js.map