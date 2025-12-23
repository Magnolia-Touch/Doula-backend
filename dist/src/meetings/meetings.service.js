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
        console.log('form', Form);
        const meeting = await this.prisma.meetings.create({
            data: {
                link: meetLink,
                status: client_1.MeetingStatus.SCHEDULED,
                startTime: Form.startTime,
                endTime: Form.endTime,
                date: Form.date,
                serviceName: Form.serviceName,
                remarks: Form.additionalNotes,
                bookedById: clientId,
                availableSlotsForMeetingId: slotParentId,
                ...profileData,
            },
        });
        console.log('meeting created succesfull');
        await this.mail.sendMail({
            to: Form.email,
            subject: `Confirmation of your Meeting with ${role} for Service ${Form.name}`,
            template: 'meetings',
            context: {
                date: Form.date,
                time: meeting.startTime + ' - ' + meeting.endTime,
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
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.date.lte = end;
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
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.meetings,
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                AvailableSlotsForMeeting: {
                    select: { weekday: true },
                },
                bookedBy: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                DoulaProfile: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                ZoneManagerProfile: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            ...result,
            data: result.data.map((meeting) => {
                const meetingWith = meeting.doulaProfileId
                    ? 'DOULA'
                    : meeting.zoneManagerProfileId
                        ? 'ZONE_MANAGER'
                        : null;
                return {
                    meetingId: meeting.id,
                    meetingLink: meeting.link,
                    meetingStatus: meeting.status,
                    meetingStartTime: meeting.startTime,
                    meetingEndTime: meeting.endTime,
                    meetingDate: meeting.date,
                    weekday: meeting.AvailableSlotsForMeeting?.weekday ?? null,
                    serviceName: meeting.serviceName,
                    remarks: meeting.remarks,
                    meeting_with: meetingWith,
                    client: {
                        clientId: meeting.bookedBy?.id,
                        clientName: meeting.bookedBy?.user?.name,
                        clientEmail: meeting.bookedBy?.user?.email,
                        clientPhone: meeting.bookedBy?.user?.phone,
                    },
                    doula: meetingWith === 'DOULA'
                        ? {
                            doulaId: meeting.DoulaProfile?.user?.id,
                            doulaProfileId: meeting.DoulaProfile?.id,
                            doulaName: meeting.DoulaProfile?.user?.name,
                            doulaEmail: meeting.DoulaProfile?.user?.email,
                            doulaPhone: meeting.DoulaProfile?.user?.phone,
                        }
                        : null,
                    zoneManager: meetingWith === 'ZONE_MANAGER'
                        ? {
                            zoneManagerId: meeting.ZoneManagerProfile?.user?.id,
                            zoneManagerProfileId: meeting.ZoneManagerProfile?.id,
                            zoneManagerName: meeting.ZoneManagerProfile?.user?.name,
                            zoneManagerEmail: meeting.ZoneManagerProfile?.user?.email,
                        }
                        : null,
                };
            }),
        };
    }
    async getMeetingById(id, user) {
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
        const where = { id };
        if (user.role === client_1.Role.ZONE_MANAGER) {
            where.zoneManagerProfileId = profile.id;
        }
        else if (user.role === client_1.Role.DOULA) {
            where.doulaProfileId = profile.id;
        }
        else if (user.role === client_1.Role.ADMIN) {
            where.adminProfileId = profile.id;
        }
        const meeting = await this.prisma.meetings.findFirst({
            where,
            include: {
                AvailableSlotsForMeeting: {
                    select: { weekday: true },
                },
                bookedBy: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                DoulaProfile: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                ZoneManagerProfile: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!meeting) {
            throw new common_1.NotFoundException('Meeting Not Found or Access Denied');
        }
        const meetingWith = meeting.doulaProfileId
            ? 'DOULA'
            : meeting.zoneManagerProfileId
                ? 'ZONE_MANAGER'
                : null;
        return {
            meetingId: meeting.id,
            meetingLink: meeting.link,
            meetingStatus: meeting.status,
            meetingStartTime: meeting.startTime,
            meetingEndTime: meeting.endTime,
            meetingDate: meeting.date,
            weekday: meeting.AvailableSlotsForMeeting?.weekday ?? null,
            serviceName: meeting.serviceName,
            remarks: meeting.remarks,
            meeting_with: meetingWith,
            client: {
                clientId: meeting.bookedBy?.id,
                clientName: meeting.bookedBy?.user?.name,
                clientEmail: meeting.bookedBy?.user?.email,
                clientPhone: meeting.bookedBy?.user?.phone,
            },
            doula: meetingWith === 'DOULA'
                ? {
                    doulaId: meeting.DoulaProfile?.user?.id,
                    doulaProfileId: meeting.DoulaProfile?.id,
                    doulaName: meeting.DoulaProfile?.user?.name,
                    doulaEmail: meeting.DoulaProfile?.user?.email,
                    doulaPhone: meeting.DoulaProfile?.user?.phone,
                }
                : null,
            zoneManager: meetingWith === 'ZONE_MANAGER'
                ? {
                    zoneManagerId: meeting.ZoneManagerProfile?.user?.id,
                    zoneManagerProfileId: meeting.ZoneManagerProfile?.id,
                    zoneManagerName: meeting.ZoneManagerProfile?.user?.name,
                    zoneManagerEmail: meeting.ZoneManagerProfile?.user?.email,
                }
                : null,
        };
    }
    async rescheduleMeeting(dto, user) {
        const meeting = await this.prisma.meetings.findUnique({
            where: { id: dto.meetingId },
            include: {
                DoulaProfile: {
                    include: {
                        zoneManager: true,
                    },
                },
            },
        });
        if (!meeting)
            throw new common_1.NotFoundException('Meeting not found');
        if (user.role === client_1.Role.ADMIN) {
        }
        else if (user.role === client_1.Role.ZONE_MANAGER) {
            const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
                include: { doulas: true },
            });
            if (!zoneManagerProfile)
                throw new common_1.ForbiddenException('Zone Manager profile not found');
            const zoneManagerId = zoneManagerProfile.id;
            const ownsMeeting = meeting.zoneManagerProfileId === zoneManagerId;
            const doulaBelongsToZoneManager = zoneManagerProfile.doulas.some((d) => d.id === meeting.doulaProfileId);
            if (!ownsMeeting && !doulaBelongsToZoneManager) {
                throw new common_1.ForbiddenException("You can reschedule only your meetings or your doulas' meetings");
            }
        }
        else {
            throw new common_1.ForbiddenException('You are not allowed to reschedule meetings');
        }
        const [startTime, endTime] = dto.meetingsTimeSlots.split('-');
        if (!startTime || !endTime) {
            throw new Error('Invalid time slot format. Expected HH:mm-HH:mm');
        }
        const startDateTime = new Date(`${dto.meetingsDate}T${startTime}:00`);
        const endDateTime = new Date(`${dto.meetingsDate}T${startTime}:00`);
        const updated = await this.prisma.meetings.update({
            where: { id: dto.meetingId },
            data: {
                startTime: startDateTime,
                endTime: endDateTime,
                date: new Date(dto.meetingsDate),
                rescheduledAt: new Date(),
                status: client_1.MeetingStatus.SCHEDULED,
            },
        });
        return updated;
    }
    async updateMeetingStatus(dto, userId) {
        const { status, meetingId } = dto;
        const meeting = await this.prisma.meetings.findFirst({
            where: {
                id: meetingId,
                OR: [
                    {
                        ZoneManagerProfile: { userId: userId },
                    },
                    {
                        DoulaProfile: { userId: userId },
                    },
                ],
            },
            select: { status: true },
        });
        if (!meeting) {
            throw new common_1.NotFoundException('Meeting not found');
        }
        const updated = await this.prisma.meetings.update({
            where: { id: dto.meetingId },
            data: {
                status: dto.status,
                cancelledAt: dto.status === client_1.MeetingStatus.CANCELED ? new Date() : null,
            },
        });
        return {
            message: 'Meeting status updated',
            meeting: updated,
        };
    }
    async deleteAllMeetings(user) {
        if (user.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only Admin can perform bulk deletion');
        }
        await this.prisma.availableSlotsTimeForMeeting.updateMany({
            data: {
                isBooked: false,
                availabe: true,
            },
        });
        const result = await this.prisma.meetings.deleteMany({});
        return {
            message: 'All meetings deleted successfully',
            count: result.count,
        };
    }
    async doulasMeetingSchedule(dto, user) {
        const { clientId, serviceName, meetingsDate, meetingsTimeSlots, doulaId, additionalNotes, serviceId, } = dto;
        console.log(user);
        if (user.role !== client_1.Role.ZONE_MANAGER) {
            throw new common_1.ForbiddenException('Only Zone Manager can schedule doula meetings');
        }
        const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId: user.id },
        });
        if (!zoneManagerProfile) {
            throw new common_1.ForbiddenException('Zone Manager profile not found');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { id: doulaId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const doulaUser = await this.prisma.user.findUnique({
            where: { id: doulaProfile.userId },
        });
        if (!doulaUser) {
            throw new common_1.NotFoundException('Doula user not found');
        }
        const weekday = await (0, service_utils_1.getWeekdayFromDate)(meetingsDate);
        const slot = await (0, service_utils_1.findSlotOrThrow)(this.prisma, {
            ownerRole: client_1.Role.DOULA,
            ownerProfileId: doulaProfile.id,
            weekday,
        });
        console.log('slot', slot);
        const exists = await (0, service_utils_1.isMeetingExists)(this.prisma, new Date(meetingsDate), meetingsTimeSlots, {
            doulaProfileId: doulaProfile.id,
        });
        if (exists) {
            throw new common_1.BadRequestException('Meeting already exists for this time slot');
        }
        const meetCode = Math.random().toString(36).slice(2, 10);
        const meetLink = `https://meet.google.com/${meetCode}`;
        const [startTime, endTime] = meetingsTimeSlots.split('-');
        if (!startTime || !endTime) {
            throw new Error('Invalid time slot format. Expected HH:mm-HH:mm');
        }
        const startDateTime = new Date(`${meetingsDate}T${startTime}:00`);
        const endDateTime = new Date(`${meetingsDate}T${startTime}:00`);
        const meeting = await this.prisma.meetings.create({
            data: {
                link: meetLink,
                status: client_1.MeetingStatus.SCHEDULED,
                startTime: startDateTime,
                endTime: endDateTime,
                date: new Date(meetingsDate),
                serviceName: serviceName,
                remarks: additionalNotes,
                bookedById: clientId,
                availableSlotsForMeetingId: slot.id,
                doulaProfileId: doulaProfile.id,
                serviceId: serviceId,
            },
        });
        console.log('meeting created succesfull');
        return {
            message: 'Doula meeting scheduled successfully',
            meeting,
        };
    }
    async findAllmeetings() {
        return this.prisma.meetings.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                bookedBy: true,
                AvailableSlotsForMeeting: true,
                ZoneManagerProfile: true,
                DoulaProfile: true,
                AdminProfile: true,
                Service: true,
            },
        });
    }
    async getBookedMeetingsByDate(params) {
        const { doulaProfileId, zoneManagerProfileId, date } = params;
        if (!doulaProfileId && !zoneManagerProfileId) {
            throw new common_1.BadRequestException('Either doulaProfileId or zoneManagerProfileId is required');
        }
        if (doulaProfileId && zoneManagerProfileId) {
            throw new common_1.BadRequestException('Provide only one: doulaProfileId OR zoneManagerProfileId');
        }
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const where = {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
            status: {
                notIn: [client_1.MeetingStatus.CANCELED],
            },
        };
        if (doulaProfileId) {
            where.doulaProfileId = doulaProfileId;
        }
        if (zoneManagerProfileId) {
            where.zoneManagerProfileId = zoneManagerProfileId;
        }
        const meetings = await this.prisma.meetings.findMany({
            where,
            select: {
                date: true,
                startTime: true,
                endTime: true,
            },
            orderBy: {
                startTime: 'asc',
            },
        });
        return {
            date,
            totalBookedSlots: meetings.length,
            bookings: meetings.map((m) => ({
                meetingDate: m.date,
                startTime: m.startTime,
                endTime: m.endTime,
            })),
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