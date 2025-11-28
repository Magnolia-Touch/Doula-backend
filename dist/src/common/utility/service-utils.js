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
exports.getServiceSlotOrCreateSlot = getServiceSlotOrCreateSlot;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
async function findSlotOrThrow(prisma, slotId) {
    const slot = await prisma.availableSlotsTimeForMeeting.findUnique({
        where: { id: slotId },
    });
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
        where: { id: userId }
    });
    if (!user) {
        throw new common_1.NotFoundException("User Not found");
    }
    return user?.role;
}
async function findUserProfileId(prisma, userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new common_1.NotFoundException("User Not found");
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
async function getSlotOrCreateSlot(prisma, dateString, userRole, profileId) {
    const formatted = dateString.split("T")[0];
    const slotDate = new Date(formatted + "T00:00:00.000Z");
    const weekday = slotDate.toLocaleDateString("en-US", { weekday: "long" });
    const uniqueWhere = userRole === client_1.Role.DOULA
        ? { doulaId_date: { doulaId: profileId, date: slotDate } }
        : userRole === client_1.Role.ADMIN
            ? { adminId_date: { adminId: profileId, date: slotDate } }
            : { zoneManagerId_date: { zoneManagerId: profileId, date: slotDate } };
    const ownerField = userRole === client_1.Role.DOULA ? "doulaId" :
        userRole === client_1.Role.ADMIN ? "adminId" :
            "zoneManagerId";
    let slot = await prisma.availableSlotsForMeeting.findUnique({
        where: uniqueWhere,
    });
    if (slot)
        return slot;
    slot = await prisma.availableSlotsForMeeting.create({
        data: {
            date: slotDate,
            weekday,
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
            isBooked: false
        }
    });
}
function toUTCDate(dateString) {
    const d = new Date(dateString);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
async function getOrcreateClent(prisma, data) {
    let user;
    console.log("data", data);
    user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
            clientProfile: true
        }
    });
    if (user)
        return user;
    user = prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: client_1.Role.CLIENT,
            clientProfile: { create: {} }
        },
        include: {
            clientProfile: true
        }
    });
    return user;
}
async function getServiceSlotOrCreateSlot(prisma, dateString, profileId) {
    const formatted = dateString.split("T")[0];
    const slotDate = new Date(formatted + "T00:00:00.000Z");
    const weekday = slotDate.toLocaleDateString("en-US", { weekday: "long" });
    let slot = await prisma.availableSlotsForService.findUnique({
        where: {
            doulaId_date: {
                doulaId: profileId,
                date: slotDate
            }
        },
    });
    if (slot)
        return slot;
    slot = await prisma.availableSlotsForService.create({
        data: {
            date: slotDate,
            weekday,
            availabe: true,
            doulaId: profileId
        },
    });
    return slot;
}
//# sourceMappingURL=service-utils.js.map