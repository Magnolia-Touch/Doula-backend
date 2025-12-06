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
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_util_1 = require("../common/utility/pagination.util");
const client_1 = require("@prisma/client");
const mailer_1 = require("@nestjs-modules/mailer");
const service_utils_1 = require("../common/utility/service-utils");
let MeetingsService = class MeetingsService {
    prisma;
    mail;
    constructor(prisma, mail) {
        this.prisma = prisma;
        this.mail = mail;
    }
    async scheduleMeeting(Form, clientId, profileId, role, slotParentId) {
        const meetCode = Math.random().toString(36).slice(2, 10);
        const meetLink = `https://meet.google.com/${meetCode}`;
        const profileData = {};
        if (role === client_1.Role.ZONE_MANAGER) {
            profileData.zoneManagerProfileId = profileId;
        }
        else if (role === client_1.Role.DOULA) {
            profileData.doulaProfileId = profileId;
        }
        else if (role === client_1.Role.ADMIN) {
            profileData.adminProfileId = profileId;
        }
        const slot = await (0, service_utils_1.findSlotOrThrow)(this.prisma, Form.slotId);
        const dateInstance = await this.prisma.availableSlotsForMeeting.findUnique({
            where: { id: slot.dateId },
        });
        const meeting = await this.prisma.meetings.create({
            data: {
                link: meetLink,
                slotId: Form.slotId,
                status: client_1.MeetingStatus.SCHEDULED,
                bookedById: clientId,
                remarks: Form.additionalNotes,
                availableSlotsForMeetingId: slotParentId,
                ...profileData
            },
        });
        console.log("meeting created succesfull");
        await this.mail.sendMail({
            to: Form.email,
            subject: `Confirmation of your Meeting with ${role} for Service ${Form.name}`,
            template: 'meetings',
            context: {
                date: dateInstance?.date,
                time: slot.startTime + ' - ' + slot.endTime,
                meetLink: meetLink,
            },
        });
        return meeting;
    }
    async getMeetings(params, user) {
        const { startDate, endDate, status, page = 1, limit = 10 } = params;
        let profile = null;
        if (user.role === client_1.Role.ZONE_MANAGER) {
            profile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
            });
        }
        else if (user.role === client_1.Role.DOULA) {
            profile = await this.prisma.doulaProfile.findUnique({
                where: { userId: user.id },
            });
        }
        else if (user.role === client_1.Role.ADMIN) {
            profile = await this.prisma.adminProfile.findUnique({
                where: { userId: user.id },
            });
        }
        if (!profile) {
            throw new common_1.NotFoundException('Profile Not Found');
        }
        const where = {};
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.slot = {
                date: {},
            };
            if (startDate) {
                where.slot.date.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.slot.date.lte = end;
            }
        }
        if (user.role === client_1.Role.ZONE_MANAGER) {
            where.zoneManagerProfileId = profile.id;
        }
        else if (user.role === client_1.Role.DOULA) {
            where.doulaProfileId = profile.id;
        }
        else if (user.role === client_1.Role.ADMIN) {
            where.adminProfileId = profile.id;
        }
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.meetings,
            page,
            limit,
            where,
            include: {
                slot: true,
                bookedBy: true,
                AvailableSlotsForMeeting: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getMeetingById(id, user) {
        let profileId = null;
        const whereCondition = { id };
        if (user.role === client_1.Role.ZONE_MANAGER) {
            const profile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
            });
            profileId = profile?.id ?? null;
            whereCondition.zoneManagerProfileId = profileId;
        }
        else if (user.role === client_1.Role.DOULA) {
            const profile = await this.prisma.doulaProfile.findUnique({
                where: { userId: user.id },
            });
            profileId = profile?.id ?? null;
            whereCondition.doulaProfileId = profileId;
        }
        else if (user.role === client_1.Role.ADMIN) {
            const profile = await this.prisma.adminProfile.findUnique({
                where: { userId: user.id },
            });
            profileId = profile?.id ?? null;
            whereCondition.adminProfileId = profileId;
        }
        const meeting = await this.prisma.meetings.findFirst({
            where: whereCondition,
            include: {
                slot: true,
                bookedBy: true,
                ZoneManagerProfile: true,
                DoulaProfile: true,
                AdminProfile: true,
                Service: true,
            },
        });
        if (!meeting)
            throw new common_1.NotFoundException("Meeting not found or access denied");
        return meeting;
    }
    async cancelMeeting(dto, user) {
        const meeting = await this.prisma.meetings.findUnique({
            where: { id: dto.meetingId },
            include: {
                slot: true,
                DoulaProfile: {
                    include: {
                        zoneManager: true,
                    },
                },
            },
        });
        if (!meeting)
            throw new common_1.NotFoundException("Meeting not found");
        if (user.role === client_1.Role.ADMIN) {
        }
        else if (user.role === client_1.Role.ZONE_MANAGER) {
            const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
                include: {
                    doulas: true,
                },
            });
            if (!zoneManagerProfile)
                throw new common_1.ForbiddenException("Zone Manager profile not found");
            const zoneManagerId = zoneManagerProfile.id;
            const ownsMeeting = meeting.zoneManagerProfileId === zoneManagerId;
            const doulaBelongsToZoneManager = zoneManagerProfile.doulas.some((doula) => doula.id === meeting.doulaProfileId);
            if (!ownsMeeting && !doulaBelongsToZoneManager) {
                throw new common_1.ForbiddenException("You can cancel only your meetings or meetings of your doulas");
            }
        }
        else {
            throw new common_1.ForbiddenException("You are not allowed to cancel meetings");
        }
        await this.prisma.meetings.update({
            where: { id: dto.meetingId },
            data: {
                status: "CANCELED",
                cancelledAt: new Date(),
            },
        });
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: meeting.slotId },
            data: { isBooked: false, availabe: true },
        });
        return { message: "Meeting canceled and slot freed" };
    }
    async rescheduleMeeting(dto, user) {
        const meeting = await this.prisma.meetings.findUnique({
            where: { id: dto.meetingId },
            include: {
                slot: true,
                DoulaProfile: {
                    include: {
                        zoneManager: true,
                    },
                },
            },
        });
        if (!meeting)
            throw new common_1.NotFoundException("Meeting not found");
        if (user.role === client_1.Role.ADMIN) {
        }
        else if (user.role === client_1.Role.ZONE_MANAGER) {
            const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
                include: { doulas: true },
            });
            if (!zoneManagerProfile)
                throw new common_1.ForbiddenException("Zone Manager profile not found");
            const zoneManagerId = zoneManagerProfile.id;
            const ownsMeeting = meeting.zoneManagerProfileId === zoneManagerId;
            const doulaBelongsToZoneManager = zoneManagerProfile.doulas.some((d) => d.id === meeting.doulaProfileId);
            if (!ownsMeeting && !doulaBelongsToZoneManager) {
                throw new common_1.ForbiddenException("You can reschedule only your meetings or your doulas' meetings");
            }
        }
        else {
            throw new common_1.ForbiddenException("You are not allowed to reschedule meetings");
        }
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: meeting.slotId },
            data: { isBooked: false, availabe: true },
        });
        const newSlot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: dto.newSlotId },
        });
        if (!newSlot)
            throw new common_1.NotFoundException("New slot not found");
        if (!newSlot.availabe || newSlot.isBooked) {
            throw new common_1.BadRequestException("New slot is not available");
        }
        const updated = await this.prisma.meetings.update({
            where: { id: dto.meetingId },
            data: {
                slotId: dto.newSlotId,
                rescheduledAt: new Date(),
                status: client_1.MeetingStatus.SCHEDULED,
            },
        });
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: dto.newSlotId },
            data: { isBooked: true, availabe: false },
        });
        return updated;
    }
    async updateMeetingStatus(dto, user) {
        const meeting = await this.prisma.meetings.findUnique({
            where: { id: dto.meetingId },
            include: {
                slot: true,
                DoulaProfile: {
                    include: {
                        zoneManager: true,
                    },
                },
            },
        });
        if (!meeting) {
            throw new common_1.NotFoundException("Meeting not found");
        }
        if (user.role === client_1.Role.ADMIN) {
        }
        else if (user.role === client_1.Role.ZONE_MANAGER) {
            const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
                include: { doulas: true },
            });
            if (!zoneManagerProfile) {
                throw new common_1.ForbiddenException("Zone Manager profile not found");
            }
            const zoneManagerId = zoneManagerProfile.id;
            const ownsMeeting = meeting.zoneManagerProfileId === zoneManagerId;
            const doulaBelongsToZoneManager = zoneManagerProfile.doulas.some((d) => d.id === meeting.doulaProfileId);
            if (!ownsMeeting && !doulaBelongsToZoneManager) {
                throw new common_1.ForbiddenException("You can update status only for your meetings or your doulas' meetings");
            }
        }
        else {
            throw new common_1.ForbiddenException("You are not allowed to update meeting status");
        }
        if (dto.status === client_1.MeetingStatus.CANCELED) {
            await this.prisma.availableSlotsTimeForMeeting.update({
                where: { id: meeting.slotId },
                data: { isBooked: false, availabe: true },
            });
        }
        const updated = await this.prisma.meetings.update({
            where: { id: dto.meetingId },
            data: {
                status: dto.status,
                cancelledAt: dto.status === client_1.MeetingStatus.CANCELED ? new Date() : null,
            },
        });
        return {
            message: "Meeting status updated",
            meeting: updated,
        };
    }
    async deleteAllMeetings(user) {
        if (user.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException("Only Admin can perform bulk deletion");
        }
        await this.prisma.availableSlotsTimeForMeeting.updateMany({
            data: {
                isBooked: false,
                availabe: true
            }
        });
        const result = await this.prisma.meetings.deleteMany({});
        return {
            message: "All meetings deleted successfully",
            count: result.count
        };
    }
    async doulasMeetingSchedule(dto, user) {
        console.log(user);
        if (user.role !== client_1.Role.ZONE_MANAGER) {
            throw new common_1.ForbiddenException("Only Zone Manager can schedule doula meetings");
        }
        const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId: user.id },
        });
        if (!zoneManagerProfile) {
            throw new common_1.ForbiddenException("Zone Manager profile not found");
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { id: dto.doulaId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException("Doula profile not found");
        }
        const doulaUser = await this.prisma.user.findUnique({
            where: { id: doulaProfile.userId }
        });
        if (!doulaUser) {
            throw new common_1.NotFoundException("Doula user not found");
        }
        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id: dto.enquiryId },
            include: {
                service: true,
                region: true,
                slot: true,
                clientProfile: true,
            },
        });
        if (!enquiry) {
            throw new common_1.NotFoundException("Enquiry not found");
        }
        if (!enquiry.clientProfile) {
            throw new common_1.BadRequestException("Client profile is missing for this enquiry");
        }
        const slot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: dto.slotId },
        });
        if (!slot)
            throw new common_1.NotFoundException("Slot not found");
        if (!slot.availabe || slot.isBooked) {
            throw new common_1.BadRequestException("Slot is not available");
        }
        const formData = {
            slotId: dto.slotId,
            additionalNotes: enquiry.additionalNotes ?? null,
            email: enquiry.email,
            name: enquiry.name,
        };
        const service = await (0, service_utils_1.findServiceOrThrowwithId)(this.prisma, enquiry.serviceId);
        const meeting = await this.scheduleMeeting(formData, enquiry.clientProfile.id, doulaProfile.id, client_1.Role.DOULA, slot.dateId);
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: dto.slotId },
            data: { isBooked: true, availabe: false },
        });
        return {
            message: "Doula meeting scheduled successfully",
            meeting,
        };
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_1.MailerService])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map