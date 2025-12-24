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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ClientsService = class ClientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const clients = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: client_1.Role.CLIENT,
                clientProfile: {
                    create: {},
                },
            },
            include: { clientProfile: true },
        });
        return { message: 'Clients created successfully', data: clients };
    }
    async get() {
        const clientss = await this.prisma.user.findMany({
            where: { role: client_1.Role.CLIENT },
            include: { clientProfile: true },
        });
        return { message: 'Clients Fetched Successfully', data: clientss };
    }
    async getById(id) {
        const clients = await this.prisma.user.findUnique({
            where: { id },
            include: { clientProfile: true },
        });
        if (!clients || clients.role !== client_1.Role.CLIENT) {
            throw new common_1.NotFoundException('Clients not found');
        }
        return { message: 'Clients fetched successfully', data: clients };
    }
    async delete(id) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== client_1.Role.CLIENT) {
            throw new common_1.NotFoundException('Client not found');
        }
        await this.prisma.user.delete({ where: { id } });
        return { message: 'Client deleted successfully', data: null };
    }
    async bookedServices(userId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
            include: {
                user: true,
                Schedules: {
                    include: {
                        serviceBooking: {
                            include: {
                                region: {
                                    select: {
                                        regionName: true,
                                    },
                                },
                                service: {
                                    include: {
                                        service: {
                                            select: {
                                                id: true,
                                                name: true,
                                            },
                                        },
                                    },
                                },
                                DoulaProfile: {
                                    include: {
                                        user: {
                                            select: {
                                                name: true,
                                            },
                                        },
                                        DoulaGallery: {
                                            select: {
                                                url: true,
                                            },
                                            take: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!clientProfile) {
            throw new Error('Client profile not found');
        }
        return clientProfile.Schedules.map((schedule) => {
            const booking = schedule.serviceBooking;
            return {
                scheduleId: schedule.id,
                userId: clientProfile.user.id,
                name: clientProfile.user.name,
                email: clientProfile.user.email,
                phone: clientProfile.user.phone,
                role: clientProfile.user.role,
                profileId: clientProfile.id,
                serviceBookingId: booking.id,
                status: booking.status,
                startDate: booking.startDate,
                endDate: booking.endDate,
                regionName: booking.region.regionName,
                serviceId: booking.service.service.id,
                servicePricingId: booking.servicePricingId,
                service: booking.service.service.name,
                doulaName: booking.DoulaProfile.user.name,
                mainDoulaImage: booking.DoulaProfile.profile_image,
            };
        });
    }
    async bookedServiceById(userId, serviceBookingId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
            include: {
                user: true,
            },
        });
        if (!clientProfile) {
            throw new Error('Client profile not found');
        }
        const schedule = await this.prisma.schedules.findFirst({
            where: {
                id: serviceBookingId,
                clientId: clientProfile.id,
            },
            include: {
                serviceBooking: {
                    include: {
                        region: {
                            select: {
                                regionName: true,
                            },
                        },
                        service: {
                            include: {
                                service: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                        DoulaProfile: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                    },
                                },
                                DoulaGallery: {
                                    select: {
                                        url: true,
                                    },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!schedule) {
            throw new Error('Service booking not found');
        }
        const booking = schedule.serviceBooking;
        return {
            scheduleId: schedule.id,
            userId: clientProfile.user.id,
            name: clientProfile.user.name,
            email: clientProfile.user.email,
            phone: clientProfile.user.phone,
            role: clientProfile.user.role,
            profileId: clientProfile.id,
            serviceBookingId: booking.id,
            status: booking.status,
            startDate: booking.startDate,
            endDate: booking.endDate,
            regionName: booking.region.regionName,
            serviceId: booking.service.service.id,
            servicePricingId: booking.servicePricingId,
            service: booking.service.service.name,
            doulaName: booking.DoulaProfile.user.name,
            mainDoulaImage: booking.DoulaProfile.profile_image,
        };
    }
    async cancelServiceBooking(userId, serviceBookingId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });
        if (!clientProfile) {
            throw new Error('Client profile not found');
        }
        const booking = await this.prisma.serviceBooking.findFirst({
            where: {
                id: serviceBookingId,
                clientId: clientProfile.id,
            },
        });
        if (!booking) {
            throw new Error('Service booking not found');
        }
        if (booking.status === 'CANCELED') {
            throw new Error('Service booking is already canceled');
        }
        if (booking.status === 'COMPLETED') {
            throw new Error('Completed bookings cannot be canceled');
        }
        const canceledBooking = await this.prisma.serviceBooking.update({
            where: { id: booking.id },
            data: {
                status: client_1.BookingStatus.CANCELED,
                cancelledAt: new Date(),
            },
        });
        return {
            message: 'Service booking canceled successfully',
            serviceBookingId: canceledBooking.id,
            status: canceledBooking.status,
        };
    }
    async Meetings(userId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                Meetings: {
                    include: {
                        DoulaProfile: {
                            include: {
                                user: {
                                    select: { name: true },
                                },
                            },
                        },
                        ZoneManagerProfile: {
                            include: {
                                user: {
                                    select: { name: true },
                                },
                            },
                        },
                        AvailableSlotsForMeeting: {
                            select: { weekday: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!clientProfile) {
            throw new common_1.NotFoundException('Client profile not found');
        }
        return clientProfile.Meetings.map((meeting) => {
            const hostname = meeting.DoulaProfile?.user?.name ??
                meeting.ZoneManagerProfile?.user?.name ??
                null;
            const meetingWith = meeting.doulaProfileId
                ? 'DOULA'
                : meeting.zoneManagerProfileId
                    ? 'ZONE_MANAGER'
                    : null;
            return {
                clientId: clientProfile.user.id,
                clientName: clientProfile.user.name,
                clientEmail: clientProfile.user.email,
                clientPhone: clientProfile.user.phone,
                clientProfileId: clientProfile.id,
                meetingId: meeting.id,
                meetingWith,
                hostname,
                meetingDate: meeting.date,
                weekday: meeting.AvailableSlotsForMeeting?.weekday ?? null,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                link: meeting.link,
                serviceName: meeting.serviceName,
                remarks: meeting.remarks,
                status: meeting.status,
            };
        });
    }
    async meetingById(userId, meetingId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
        if (!clientProfile) {
            throw new common_1.NotFoundException('Client profile not found');
        }
        const meeting = await this.prisma.meetings.findFirst({
            where: {
                id: meetingId,
                bookedById: clientProfile.id,
            },
            include: {
                DoulaProfile: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
                ZoneManagerProfile: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
                AvailableSlotsForMeeting: {
                    select: { weekday: true },
                },
            },
        });
        if (!meeting) {
            throw new common_1.NotFoundException('Meeting not found');
        }
        const hostname = meeting.DoulaProfile?.user?.name ??
            meeting.ZoneManagerProfile?.user?.name ??
            null;
        const meetingWith = meeting.doulaProfileId
            ? 'DOULA'
            : meeting.zoneManagerProfileId
                ? 'ZONE_MANAGER'
                : null;
        return {
            clientId: clientProfile.user.id,
            clientName: clientProfile.user.name,
            clientEmail: clientProfile.user.email,
            clientPhone: clientProfile.user.phone,
            clientProfileId: clientProfile.id,
            meetingId: meeting.id,
            meetingWith,
            hostname,
            meetingDate: meeting.date,
            weekday: meeting.AvailableSlotsForMeeting?.weekday ?? null,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            link: meeting.link,
            serviceName: meeting.serviceName,
            remarks: meeting.remarks,
            status: meeting.status,
            createdAt: meeting.createdAt,
            cancelledAt: meeting.cancelledAt,
            rescheduledAt: meeting.rescheduledAt,
        };
    }
    async cancelMeeting(userId, meetingId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });
        if (!clientProfile) {
            throw new common_1.NotFoundException('Client profile not found');
        }
        const meeting = await this.prisma.meetings.findFirst({
            where: {
                id: meetingId,
                bookedById: clientProfile.id,
            },
            include: {
                AvailableSlotsTimeForMeeting: {
                    select: { id: true },
                },
            },
        });
        if (!meeting) {
            throw new common_1.NotFoundException('Meeting not found');
        }
        if (meeting.status === client_1.MeetingStatus.CANCELED) {
            throw new common_1.BadRequestException('Meeting is already canceled');
        }
        if (meeting.status === client_1.MeetingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Completed meetings cannot be canceled');
        }
        const canceledMeeting = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.meetings.update({
                where: { id: meeting.id },
                data: {
                    status: client_1.MeetingStatus.CANCELED,
                    cancelledAt: new Date(),
                },
            });
            if (meeting.AvailableSlotsTimeForMeeting.length > 0) {
                await tx.availableSlotsTimeForMeeting.updateMany({
                    where: {
                        id: {
                            in: meeting.AvailableSlotsTimeForMeeting.map((s) => s.id),
                        },
                    },
                    data: {
                        isBooked: false,
                        availabe: true,
                    },
                });
            }
            return updated;
        });
        return {
            message: 'Meeting canceled successfully',
            meetingId: canceledMeeting.id,
            status: canceledMeeting.status,
            cancelledAt: canceledMeeting.cancelledAt,
        };
    }
    async recentActivity(userId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });
        if (!clientProfile) {
            throw new Error('Client profile not found');
        }
        const bookings = await this.prisma.serviceBooking.findMany({
            where: {
                clientId: clientProfile.id,
            },
            include: {
                DoulaProfile: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });
        const meetings = await this.prisma.meetings.findMany({
            where: {
                bookedById: clientProfile.id,
            },
            include: {
                DoulaProfile: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
                ZoneManagerProfile: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });
        const bookingActivities = bookings.flatMap((booking) => {
            const activities = [];
            activities.push({
                type: 'BOOKING_CREATED',
                title: 'New Booking Created',
                description: `You booked ${booking.DoulaProfile.user.name}`,
                date: booking.createdAt,
            });
            if (booking.status === 'COMPLETED') {
                activities.push({
                    type: 'BOOKING_COMPLETED',
                    title: 'Booking Completed',
                    description: `Your booking with ${booking.DoulaProfile.user.name} was completed successfully`,
                    date: booking.updatedAt,
                });
            }
            if (booking.status === 'CANCELED') {
                activities.push({
                    type: 'BOOKING_CANCELED',
                    title: 'Booking Canceled',
                    description: `You canceled your booking with ${booking.DoulaProfile.user.name}`,
                    date: booking.updatedAt,
                });
            }
            return activities;
        });
        const meetingActivities = meetings.map((meeting) => {
            let hostName = 'Host';
            if (meeting.DoulaProfile?.user?.name) {
                hostName = meeting.DoulaProfile.user.name;
            }
            else if (meeting.ZoneManagerProfile?.user?.name) {
                hostName = meeting.ZoneManagerProfile.user.name;
            }
            return {
                type: 'MEETING_SCHEDULED',
                title: 'Meeting Scheduled',
                description: `Initial consultation with ${hostName}`,
                date: meeting.createdAt,
            };
        });
        return [...bookingActivities, ...meetingActivities].sort((a, b) => b.date.getTime() - a.date.getTime());
    }
    async profile(userId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!clientProfile) {
            throw new Error('Client profile not found');
        }
        return {
            userId: clientProfile.user.id,
            name: clientProfile.user.name,
            email: clientProfile.user.email,
            phone: clientProfile.user.phone,
            profile_image: clientProfile.profile_image,
            region: clientProfile.region,
            profileId: clientProfile.id,
            address: clientProfile.address,
            memberSince: clientProfile.createdAt,
        };
    }
    async updateProfile(userId, dto) {
        const { name, address, region } = dto;
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
            include: {
                user: true,
            },
        });
        if (!clientProfile) {
            throw new common_1.NotFoundException('Client profile not found');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { name },
        });
        const updatedProfile = await this.prisma.clientProfile.update({
            where: { userId },
            data: {
                address,
                region,
            },
            include: {
                user: true,
            },
        });
        return {
            userId: updatedProfile.user.id,
            name: updatedProfile.user.name,
            email: updatedProfile.user.email,
            phone: updatedProfile.user.phone,
            profileId: updatedProfile.id,
            profile_image: updatedProfile.profile_image,
            address: updatedProfile.address,
            region: updatedProfile.region,
            memberSince: updatedProfile.createdAt,
        };
    }
    async addClientProfileImage(userId, profileImageUrl) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });
        if (!clientProfile) {
            throw new common_1.NotFoundException('Client profile not found');
        }
        await this.prisma.clientProfile.update({
            where: { userId: userId },
            data: { profile_image: profileImageUrl },
        });
        return {
            message: 'Image uploaded successfully',
            data: clientProfile,
        };
    }
    async getClientProfileImages(userId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
            select: { id: true, profile_image: true },
        });
        if (!clientProfile) {
            throw new common_1.NotFoundException('Client profile not found');
        }
        const images = await this.prisma.clientProfile.findUnique({
            where: {
                userId: clientProfile.id,
            },
            select: { profile_image: true },
        });
        return {
            status: 'success',
            message: 'Client Profile Image fetched successfully',
            data: clientProfile,
        };
    }
    async deleteClientProfileImage(userId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });
        if (!clientProfile) {
            throw new common_1.NotFoundException('Client profile not found');
        }
        const image = await this.prisma.clientProfile.update({
            where: { userId: userId },
            data: { profile_image: null },
        });
        return { message: 'Image deleted successfully' };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=client.service.js.map