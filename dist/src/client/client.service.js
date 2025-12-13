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
            include: { clientProfile: true }
        });
        return { message: "Clients Fetched Successfully", data: clientss };
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
                bookings: {
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
                                DoulaImages: {
                                    where: { isMain: true },
                                    select: {
                                        url: true,
                                    },
                                    take: 1,
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
        return clientProfile.bookings.map((booking) => ({
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
            mainDoulaImage: booking.DoulaProfile.DoulaImages.length > 0
                ? booking.DoulaProfile.DoulaImages[0].url
                : null,
        }));
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
        const booking = await this.prisma.serviceBooking.findFirst({
            where: {
                id: serviceBookingId,
                clientId: clientProfile.id,
            },
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
                        DoulaImages: {
                            where: { isMain: true },
                            select: {
                                url: true,
                            },
                            take: 1,
                        },
                    },
                },
            },
        });
        if (!booking) {
            throw new Error('Service booking not found');
        }
        return {
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
            mainDoulaImage: booking.DoulaProfile.DoulaImages.length > 0
                ? booking.DoulaProfile.DoulaImages[0].url
                : null,
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
                        slot: {
                            include: {
                                date: {
                                    select: {
                                        date: true,
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
                            },
                        },
                        ZoneManagerProfile: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
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
        return clientProfile.Meetings.map((meeting) => {
            let hostname = null;
            if (meeting.DoulaProfile?.user?.name) {
                hostname = meeting.DoulaProfile.user.name;
            }
            else if (meeting.ZoneManagerProfile?.user?.name) {
                hostname = meeting.ZoneManagerProfile.user.name;
            }
            return {
                meetingId: meeting.id,
                userId: clientProfile.user.id,
                name: clientProfile.user.name,
                email: clientProfile.user.email,
                phone: clientProfile.user.phone,
                profileId: clientProfile.id,
                hostname,
                date: meeting.slot.date.date,
                startTime: meeting.slot.startTime,
                endTime: meeting.slot.endTime,
                link: meeting.link,
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
            throw new Error('Client profile not found');
        }
        const meeting = await this.prisma.meetings.findFirst({
            where: {
                id: meetingId,
                bookedById: clientProfile.id,
            },
            include: {
                slot: {
                    include: {
                        date: {
                            select: {
                                date: true,
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
                    },
                },
                ZoneManagerProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        let hostname = null;
        if (meeting.DoulaProfile?.user?.name) {
            hostname = meeting.DoulaProfile.user.name;
        }
        else if (meeting.ZoneManagerProfile?.user?.name) {
            hostname = meeting.ZoneManagerProfile.user.name;
        }
        return {
            userId: clientProfile.user.id,
            name: clientProfile.user.name,
            email: clientProfile.user.email,
            phone: clientProfile.user.phone,
            profileId: clientProfile.id,
            hostname,
            date: meeting.slot.date.date,
            startTime: meeting.slot.startTime,
            endTime: meeting.slot.endTime,
            link: meeting.link,
            remarks: meeting.remarks,
            status: meeting.status,
        };
    }
    async cancelMeeting(userId, meetingId) {
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });
        if (!clientProfile) {
            throw new Error('Client profile not found');
        }
        const meeting = await this.prisma.meetings.findFirst({
            where: {
                id: meetingId,
                bookedById: clientProfile.id,
            },
            include: {
                slot: true,
            },
        });
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        if (meeting.status === client_1.MeetingStatus.CANCELED) {
            throw new Error('Meeting is already canceled');
        }
        if (meeting.status === client_1.MeetingStatus.COMPLETED) {
            throw new Error('Completed meetings cannot be canceled');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const canceledMeeting = await tx.meetings.update({
                where: { id: meeting.id },
                data: {
                    status: client_1.MeetingStatus.CANCELED,
                    cancelledAt: new Date(),
                },
            });
            await tx.availableSlotsTimeForMeeting.update({
                where: { id: meeting.slotId },
                data: {
                    isBooked: false,
                    availabe: true,
                },
            });
            return canceledMeeting;
        });
        return {
            message: 'Meeting canceled successfully',
            meetingId: result.id,
            status: result.status,
            cancelledAt: result.cancelledAt,
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
            profileId: clientProfile.id,
            address: clientProfile.address,
            memberSince: clientProfile.createdAt,
        };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=client.service.js.map