import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
// import { UpdateclientsDto } from './dto/update-zone-manager.dto';
import { BookingStatus, MeetingStatus, Role } from '@prisma/client';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    // Create new Clients
    async create(dto: CreateClientDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }
        const clients = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: Role.CLIENT,
                clientProfile: {
                    create: {},
                },
            },
            include: { clientProfile: true },
        });

        return { message: 'Clients created successfully', data: clients };
    }

    // Get all Clients
    async get() {
        const clientss = await this.prisma.user.findMany({
            where: { role: Role.CLIENT },
            include: { clientProfile: true }
        })
        return { message: "Clients Fetched Successfully", data: clientss }
    }

    // Get Clients by ID
    async getById(id: string) {
        const clients = await this.prisma.user.findUnique({
            where: { id },
            include: { clientProfile: true },
        });

        if (!clients || clients.role !== Role.CLIENT) {
            throw new NotFoundException('Clients not found');
        }

        return { message: 'Clients fetched successfully', data: clients };
    }

    // Look on Client needed side
    // // ✅ Update Zone Manager details
    // async update(id: string, dto: UpdateclientsDto) {
    //     const existing = await this.prisma.user.findUnique({ where: { id } });
    //     if (!existing || existing.role !== Role.ZONE_MANAGER) {
    //         throw new NotFoundException('Zone Manager not found');
    //     }

    //     const updated = await this.prisma.user.update({
    //         where: { id },
    //         data: {
    //             name: dto.name ?? existing.name,
    //             email: dto.email ?? existing.email,
    //             phone: dto.phone ?? existing.phone,
    //             clientsprofile: dto.zoneName || dto.region ? {
    //                 update: {
    //                     zoneName: dto.zoneName ?? existing.clientsprofile?.zoneName,
    //                     region: dto.region ?? existing.clientsprofile?.region,
    //                 },
    //             } : undefined,
    //         },
    //         include: { clientsprofile: true },
    //     });

    //     return { message: 'Zone Manager updated successfully', data: updated };
    // }

    // Delete Zone Manager
    async delete(id: string) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== Role.CLIENT) {
            throw new NotFoundException('Client not found');
        }

        await this.prisma.user.delete({ where: { id } });

        return { message: 'Client deleted successfully', data: null };
    }


    async bookedServices(userId: string) {
        // 1. Fetch client profile with bookings
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

        // 2. Transform response
        return clientProfile.bookings.map((booking) => ({
            // User details
            userId: clientProfile.user.id,
            name: clientProfile.user.name,
            email: clientProfile.user.email,
            phone: clientProfile.user.phone,
            role: clientProfile.user.role,

            // Client profile
            profileId: clientProfile.id,

            // Booking details
            serviceBookingId: booking.id,
            status: booking.status,
            startDate: booking.startDate,
            endDate: booking.endDate,

            // Region
            regionName: booking.region.regionName,

            // Service details
            serviceId: booking.service.service.id,
            servicePricingId: booking.servicePricingId,
            service: booking.service.service.name,

            // Doula details
            doulaName: booking.DoulaProfile.user.name,
            mainDoulaImage:
                booking.DoulaProfile.DoulaImages.length > 0
                    ? booking.DoulaProfile.DoulaImages[0].url
                    : null,
        }));
    }

    async bookedServiceById(userId: string, serviceBookingId: string) {
        // 1. Fetch client profile
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
            include: {
                user: true,
            },
        });

        if (!clientProfile) {
            throw new Error('Client profile not found');
        }

        // 2. Fetch booking by ID and validate ownership
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

        // 3. Response mapping (same shape as list API)
        return {
            // User details
            userId: clientProfile.user.id,
            name: clientProfile.user.name,
            email: clientProfile.user.email,
            phone: clientProfile.user.phone,
            role: clientProfile.user.role,

            // Client profile
            profileId: clientProfile.id,

            // Booking details
            serviceBookingId: booking.id,
            status: booking.status,
            startDate: booking.startDate,
            endDate: booking.endDate,

            // Region
            regionName: booking.region.regionName,

            // Service details
            serviceId: booking.service.service.id,
            servicePricingId: booking.servicePricingId,
            service: booking.service.service.name,

            // Doula details
            doulaName: booking.DoulaProfile.user.name,
            mainDoulaImage:
                booking.DoulaProfile.DoulaImages.length > 0
                    ? booking.DoulaProfile.DoulaImages[0].url
                    : null,
        };
    }

    async cancelServiceBooking(userId: string, serviceBookingId: string) {
        // 1. Fetch client profile
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });

        if (!clientProfile) {
            throw new Error('Client profile not found');
        }

        // 2. Fetch booking and validate ownership
        const booking = await this.prisma.serviceBooking.findFirst({
            where: {
                id: serviceBookingId,
                clientId: clientProfile.id,
            },
        });

        if (!booking) {
            throw new Error('Service booking not found');
        }

        // 3. Business rules
        if (booking.status === 'CANCELED') {
            throw new Error('Service booking is already canceled');
        }

        if (booking.status === 'COMPLETED') {
            throw new Error('Completed bookings cannot be canceled');
        }

        // 4. Cancel booking
        const canceledBooking = await this.prisma.serviceBooking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.CANCELED,
                cancelledAt: new Date(),
            },
        });

        // 5. Optional: release slots / trigger refund / notify doula
        // await this.releaseServiceSlots(booking.id);
        // await this.refundPayment(booking.paymentDetails);
        // await this.notifyDoula(booking.doulaProfileId);

        return {
            message: 'Service booking canceled successfully',
            serviceBookingId: canceledBooking.id,
            status: canceledBooking.status,
        };
    }


    async Meetings(userId: string) {
        // 1. Fetch client profile with meetings
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

        // 2. Transform response
        return clientProfile.Meetings.map((meeting) => {
            let hostname: string | null = null;

            if (meeting.DoulaProfile?.user?.name) {
                hostname = meeting.DoulaProfile.user.name;
            } else if (meeting.ZoneManagerProfile?.user?.name) {
                hostname = meeting.ZoneManagerProfile.user.name;
            }

            return {
                // User details
                meetingId: meeting.id,
                userId: clientProfile.user.id,
                name: clientProfile.user.name,
                email: clientProfile.user.email,
                phone: clientProfile.user.phone,

                // Client profile
                profileId: clientProfile.id,

                // Meeting details
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

    async meetingById(userId: string, meetingId: string) {
        // 1. Fetch client profile
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

        // 2. Fetch meeting and validate ownership
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

        // 3. Resolve hostname
        let hostname: string | null = null;

        if (meeting.DoulaProfile?.user?.name) {
            hostname = meeting.DoulaProfile.user.name;
        } else if (meeting.ZoneManagerProfile?.user?.name) {
            hostname = meeting.ZoneManagerProfile.user.name;
        }

        // 4. Response mapping (same shape as list API)
        return {
            // User details
            userId: clientProfile.user.id,
            name: clientProfile.user.name,
            email: clientProfile.user.email,
            phone: clientProfile.user.phone,

            // Client profile
            profileId: clientProfile.id,

            // Meeting details
            hostname,
            date: meeting.slot.date.date,
            startTime: meeting.slot.startTime,
            endTime: meeting.slot.endTime,
            link: meeting.link,
            remarks: meeting.remarks,
            status: meeting.status,
        };
    }

    async cancelMeeting(userId: string, meetingId: string) {
        // 1. Fetch client profile
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });

        if (!clientProfile) {
            throw new Error('Client profile not found');
        }

        // 2. Fetch meeting and validate ownership
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

        // 3. Business rules
        if (meeting.status === MeetingStatus.CANCELED) {
            throw new Error('Meeting is already canceled');
        }

        if (meeting.status === MeetingStatus.COMPLETED) {
            throw new Error('Completed meetings cannot be canceled');
        }

        // 4. Transaction: cancel meeting + release slot
        const result = await this.prisma.$transaction(async (tx) => {
            const canceledMeeting = await tx.meetings.update({
                where: { id: meeting.id },
                data: {
                    status: MeetingStatus.CANCELED,
                    cancelledAt: new Date(),
                },
            });

            // Release the slot
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



    async recentActivity(userId: string) {
        // 1. Get client profile
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });

        if (!clientProfile) {
            throw new Error('Client profile not found');
        }

        // 2. Fetch bookings
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

        // 3. Fetch meetings
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
        type RecentActivity = {
            type:
            | 'BOOKING_CREATED'
            | 'BOOKING_COMPLETED'
            | 'BOOKING_CANCELED'
            | 'MEETING_SCHEDULED'
            | 'MEETING_CANCELED';
            title: string;
            description: string;
            date: Date;
        };



        const bookingActivities = bookings.flatMap(
            (booking): RecentActivity[] => {
                const activities: RecentActivity[] = [];

                // Booking Created
                activities.push({
                    type: 'BOOKING_CREATED',
                    title: 'New Booking Created',
                    description: `You booked ${booking.DoulaProfile.user.name}`,
                    date: booking.createdAt,
                });

                // Booking Completed
                if (booking.status === 'COMPLETED') {
                    activities.push({
                        type: 'BOOKING_COMPLETED',
                        title: 'Booking Completed',
                        description: `Your booking with ${booking.DoulaProfile.user.name} was completed successfully`,
                        date: booking.updatedAt,
                    });
                }

                // Booking Canceled
                if (booking.status === 'CANCELED') {
                    activities.push({
                        type: 'BOOKING_CANCELED',
                        title: 'Booking Canceled',
                        description: `You canceled your booking with ${booking.DoulaProfile.user.name}`,
                        date: booking.updatedAt, // ideally booking.canceledAt if you add it
                    });
                }

                return activities;
            },
        );
        const meetingActivities = meetings.map((meeting) => {
            let hostName = 'Host';

            if (meeting.DoulaProfile?.user?.name) {
                hostName = meeting.DoulaProfile.user.name;
            } else if (meeting.ZoneManagerProfile?.user?.name) {
                hostName = meeting.ZoneManagerProfile.user.name;
            }

            return {
                type: 'MEETING_SCHEDULED',
                title: 'Meeting Scheduled',
                description: `Initial consultation with ${hostName}`,
                date: meeting.createdAt,
            };
        });

        // 5. Merge + sort
        return [...bookingActivities, ...meetingActivities].sort(
            (a, b) => b.date.getTime() - a.date.getTime(),
        );
    }


    async profile(userId: string) {
        // 1. Fetch client profile with user
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

        // 2. Response mapping
        return {
            // User details
            userId: clientProfile.user.id,
            name: clientProfile.user.name,
            email: clientProfile.user.email,
            phone: clientProfile.user.phone,

            // Client profile details
            profileId: clientProfile.id,
            address: clientProfile.address,

            // Member since (client creation date)
            memberSince: clientProfile.createdAt,
        };
    }

}
