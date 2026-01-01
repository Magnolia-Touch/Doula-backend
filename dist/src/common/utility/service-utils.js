"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSlotOrThrow = findSlotOrThrow;
exports.findRegionOrThrow = findRegionOrThrow;
exports.findZoneManagerOrThrowWithId = findZoneManagerOrThrowWithId;
exports.findDoulaOrThrowWithId = findDoulaOrThrowWithId;
exports.checkUserExistorNot = checkUserExistorNot;
exports.findUserOrThrowwithId = findUserOrThrowwithId;
exports.findServiceOrThrowwithId = findServiceOrThrowwithId;
exports.findUserRoleById = findUserRoleById;
exports.findUserProfileId = findUserProfileId;
exports.getSlotOrCreateSlot = getSlotOrCreateSlot;
exports.createTimeForSlot = createTimeForSlot;
exports.toUTCDate = toUTCDate;
exports.getOrcreateClent = getOrcreateClent;
exports.getWeekdayFromDate = getWeekdayFromDate;
exports.parseTimeSlot = parseTimeSlot;
exports.isMeetingExists = isMeetingExists;
exports.isOverlapping = isOverlapping;
exports.generateVisitDatesforBirthDoula = generateVisitDatesforBirthDoula;
exports.generateVisitDatesforPostPartumDoula = generateVisitDatesforPostPartumDoula;
exports.isDoulaAvailableForShift = isDoulaAvailableForShift;
exports.isDoulaOffOnShift = isDoulaOffOnShift;
exports.generateOrderId = generateOrderId;
exports.getPriceForShift = getPriceForShift;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
async function findSlotOrThrow(prisma, params) {
    const { ownerRole, ownerProfileId, weekday } = params;
    console.log('ownerRole', ownerRole);
    console.log('ownerProfileId', ownerProfileId);
    console.log('weekday', weekday);
    const where = {};
    if (ownerRole === client_1.Role.DOULA) {
        where.doulaId_weekday = {
            doulaId: ownerProfileId,
            weekday,
        };
    }
    if (ownerRole === client_1.Role.ZONE_MANAGER) {
        where.zoneManagerId_weekday = {
            zoneManagerId: ownerProfileId,
            weekday,
        };
    }
    const slot = await prisma.availableSlotsForMeeting.findUnique({
        where,
    });
    console.log('slot', slot);
    if (!slot) {
        throw new common_1.NotFoundException('Slot Not Found');
    }
    return slot;
}
async function findRegionOrThrow(prisma, regionId) {
    const region = await prisma.region.findUnique({
        where: { id: regionId },
    });
    if (!region) {
        throw new common_1.NotFoundException('Slot Not Found');
    }
    return region;
}
async function findZoneManagerOrThrowWithId(prisma, zoneManagerId) {
    const zoneManager = await prisma.zoneManagerProfile.findUnique({
        where: { id: zoneManagerId },
    });
    if (!zoneManager) {
        throw new common_1.NotFoundException('Zone Manager Profile Not Found');
    }
    return zoneManager;
}
async function findDoulaOrThrowWithId(prisma, profileId) {
    const doula = await prisma.doulaProfile.findUnique({
        where: { id: profileId },
    });
    if (!doula) {
        throw new common_1.NotFoundException('Doula Not Found');
    }
    return doula;
}
async function checkUserExistorNot(prisma, email) {
    const existingUser = await prisma.user.findUnique({
        where: { email: email },
    });
    if (existingUser) {
        throw new common_1.BadRequestException('User with this email already exists');
    }
    return existingUser;
}
async function findUserOrThrowwithId(prisma, userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new common_1.NotFoundException('User Not Found');
    }
    return user;
}
async function findServiceOrThrowwithId(prisma, serviceId) {
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
    });
    if (!service) {
        throw new common_1.NotFoundException('Service Not Found');
    }
    return service;
}
async function findUserRoleById(prisma, userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new common_1.NotFoundException('User Not found');
    }
    return user?.role;
}
async function findUserProfileId(prisma, userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new common_1.NotFoundException('User Not found');
    }
    return user?.role;
    let id;
    if (user?.role === client_1.Role.ZONE_MANAGER) {
        id = await prisma.zoneManagerProfile.findUnique({
            where: { userId },
        });
    }
    else if (user?.role === client_1.Role.DOULA) {
        id = await prisma.doulaProfile.findUnique({
            where: { userId },
        });
    }
    else if (user?.role === client_1.Role.ADMIN) {
        id = await prisma.adminProfile.findUnique({
            where: { userId },
        });
    }
    return id;
}
async function getSlotOrCreateSlot(prisma, week, userRole, profileId) {
    const uniqueWhere = userRole === client_1.Role.DOULA
        ? { doulaId_weekday: { doulaId: profileId, weekday: week } }
        : userRole === client_1.Role.ADMIN
            ? { adminId_weekday: { adminId: profileId, weekday: week } }
            : {
                zoneManagerId_weekday: { zoneManagerId: profileId, weekday: week },
            };
    console.log('unique where', uniqueWhere);
    const ownerField = userRole === client_1.Role.DOULA
        ? 'doulaId'
        : userRole === client_1.Role.ADMIN
            ? 'adminId'
            : 'zoneManagerId';
    let slot = await prisma.availableSlotsForMeeting.findUnique({
        where: uniqueWhere,
    });
    if (slot)
        return slot;
    slot = await prisma.availableSlotsForMeeting.create({
        data: {
            weekday: week,
            ownerRole: userRole,
            availabe: true,
            [ownerField]: profileId,
        },
    });
    return slot;
}
async function createTimeForSlot(prisma, slotId, startTime, endTime) {
    return prisma.availableSlotsTimeForMeeting.create({
        data: {
            dateId: slotId,
            startTime,
            endTime,
            availabe: true,
            isBooked: false,
        },
    });
}
function toUTCDate(dateString) {
    const d = new Date(dateString);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
async function getOrcreateClent(prisma, data) {
    let user;
    console.log('data', data);
    user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
            clientProfile: true,
        },
    });
    if (user)
        return user;
    user = prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: client_1.Role.CLIENT,
            clientProfile: { create: { is_verified: true } },
        },
        include: {
            clientProfile: true,
        },
    });
    return user;
}
function getWeekdayFromDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
        throw new Error('Invalid date');
    }
    const map = [
        client_1.WeekDays.SUNDAY,
        client_1.WeekDays.MONDAY,
        client_1.WeekDays.TUESDAY,
        client_1.WeekDays.WEDNESDAY,
        client_1.WeekDays.THURSDAY,
        client_1.WeekDays.FRIDAY,
        client_1.WeekDays.SATURDAY,
    ];
    return map[d.getDay()];
}
function parseTimeSlot(timeSlot) {
    const match = timeSlot.match(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/);
    if (!match) {
        throw new Error('Invalid time slot format. Expected HH:mm-HH:mm');
    }
    const [, sh, sm, eh, em] = match;
    const baseDate = '1970-01-01';
    return {
        startTime: new Date(`${baseDate}T${sh}:${sm}:00`),
        endTime: new Date(`${baseDate}T${eh}:${em}:00`),
    };
}
async function isMeetingExists(prisma, meetingDate, timeSlot, options) {
    const { startTime, endTime } = parseTimeSlot(timeSlot);
    const startOfDay = new Date(meetingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(meetingDate);
    endOfDay.setHours(23, 59, 59, 999);
    const meeting = await prisma.meetings.findFirst({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
            AND: [
                {
                    startTime: {
                        lt: endTime,
                    },
                },
                {
                    endTime: {
                        gt: startTime,
                    },
                },
            ],
            ...(options?.zoneManagerProfileId && {
                zoneManagerProfileId: options.zoneManagerProfileId,
            }),
            ...(options?.doulaProfileId && {
                doulaProfileId: options.doulaProfileId,
            }),
            ...(options?.adminProfileId && {
                adminProfileId: options.adminProfileId,
            }),
        },
    });
    return Boolean(meeting);
}
async function isOverlapping(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}
function generateVisitDatesforBirthDoula(start, end, buffer = 0) {
    if (buffer < 0) {
        throw new Error('Buffer cannot be negative');
    }
    const dates = [];
    const cursor = new Date(start.getTime());
    cursor.setUTCDate(cursor.getUTCDate() - buffer);
    const final = new Date(end.getTime());
    final.setUTCDate(final.getUTCDate() + buffer);
    let guard = 0;
    while (cursor.getTime() <= final.getTime()) {
        dates.push(new Date(cursor.getTime()));
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        if (++guard > 400) {
            throw new Error('Infinite loop protection triggered in generateVisitDatesforBirthDoula');
        }
    }
    return dates;
}
async function generateVisitDatesforPostPartumDoula(startDate, endDate, interval) {
    if (interval <= 0) {
        throw new common_1.BadRequestException('Interval must be greater than 0');
    }
    const dates = [];
    let current = new Date(startDate.getTime());
    while (current.getTime() <= endDate.getTime()) {
        dates.push(new Date(current.getTime()));
        current.setUTCDate(current.getUTCDate() + interval);
    }
    return dates;
}
const client_2 = require("@prisma/client");
const prisma = new client_2.PrismaClient();
async function isDoulaAvailableForShift(doulaId, date, timeShift) {
    const normalizedDate = new Date(date);
    console.log("normalised date");
    const availabilityRecord = await prisma.availableSlotsForService.findFirst({
        where: {
            doulaId,
            date: normalizedDate,
        },
        select: {
            availability: true,
        },
    });
    if (!availabilityRecord) {
        return false;
    }
    const availability = availabilityRecord.availability;
    if (availability.FULLDAY === true) {
        return true;
    }
    return availability[timeShift] === true;
}
async function isDoulaOffOnShift(doulaProfileId, date, timeShift) {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const offDayRecord = await prisma.doulaOffDays.findFirst({
        where: {
            doulaProfileId,
            date: normalizedDate,
        },
        select: {
            offtime: true,
        },
    });
    if (!offDayRecord) {
        return false;
    }
    const offtime = offDayRecord.offtime;
    if (offtime.FULLDAY === true) {
        return true;
    }
    return offtime[timeShift] === true;
}
function generateOrderId() {
    const now = new Date();
    const pad = (n, width) => {
        return n.toString().padStart(width, '0');
    };
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1, 2);
    const day = pad(now.getDate(), 2);
    const hour = pad(now.getHours(), 2);
    const minute = pad(now.getMinutes(), 2);
    const second = pad(now.getSeconds(), 2);
    const timestamp = `${year}${month}${day}${hour}${minute}${second}`;
    return `DOULAS${timestamp}`;
}
function getPriceForShift(price, shift) {
    if (!price || typeof price !== 'object') {
        throw new common_1.BadRequestException('Invalid price configuration');
    }
    const p = price;
    switch (shift) {
        case client_1.TimeShift.MORNING:
            return p.morning;
        case client_1.TimeShift.NIGHT:
            return p.night;
        case client_1.TimeShift.FULLDAY:
            return p.fullday;
        default:
            throw new common_1.BadRequestException('Invalid time shift');
    }
}
//# sourceMappingURL=service-utils.js.map