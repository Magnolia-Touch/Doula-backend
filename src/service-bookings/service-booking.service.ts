import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'src/common/utility/pagination.util';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceBookingService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: { page?: number; limit?: number; status?: any }) {
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 10;

        const where: any = {};
        if (query.status) {
            where.status = query.status;
        }

        const result = await paginate({
            prismaModel: this.prisma.serviceBooking,
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                DoulaProfile: {
                    include: {
                        user: true, // get doula user name and id
                    }
                },
                client: {
                    include: {
                        user: true, // get client user name and id
                    }
                },
                service: {
                    include: {
                        service: true, // to access Service.name
                    }
                },
                region: true,
                slot: true, // AvailableSlotsTimeForService[]
                AvailableSlotsForService: true,
            },
        });

        const items = result.data || [];

        const transformed = items.map((b: any) => {
            const clientUser = b.client?.user;
            const doulaUser = b.DoulaProfile?.user;

            // servicePricing -> service -> name
            const serviceName = b.service?.service?.name ?? null;

            // Booking date is start and end (as per your requirement)
            const startDate = b.date;
            const endDate = b.date;

            // slots. You might want a specific time field from AvailableSlotsTimeForService
            // Assuming structure has a "time" or "startTime" etc. Adjust as needed.
            const timeSlots =
                b.slot?.map((s: any) => ({
                    id: s.id,
                    startTime: s.startTime,
                    endTime: s.endTime,
                })) ?? [];

            return {
                bookingId: b.id,

                clientUserId: clientUser?.id ?? null,
                clientName: clientUser?.name ?? null,
                clientProfileId: b.client?.id ?? null,

                doulaUserId: doulaUser?.id ?? null,
                doulaName: doulaUser?.name ?? null,
                doulaProfileId: b.DoulaProfile?.id ?? null,

                regionName: b.region?.regionName ?? null,

                serviceName,
                start_date: startDate,
                end_date: endDate,
                timeSlots,
                status: b.status,
                createdAt: b.createdAt,
            };
        });

        return {
            message: 'Bookings fetched successfully',
            ...result,
            data: transformed,
        };
    }


    async findById(id: string) {
        const booking = await this.prisma.serviceBooking.findUnique({
            where: { id },
            include: {
                DoulaProfile: {
                    include: {
                        user: true,
                    },
                },
                client: {
                    include: {
                        user: true,
                    },
                },
                service: {
                    include: {
                        service: true,
                    },
                },
                region: true,
                slot: true, // AvailableSlotsTimeForService[]
                AvailableSlotsForService: true,
            },
        });

        if (!booking) {
            throw new NotFoundException('Service booking not found');
        }

        const clientUser = booking.client?.user;
        const doulaUser = booking.DoulaProfile?.user;

        const serviceName = booking.service?.service?.name ?? null;

        const startDate = booking.date;
        const endDate = booking.date;

        const timeSlots =
            booking.slot?.map((s: any) => ({
                id: s.id,
                startTime: s.startTime,
                endTime: s.endTime,
            })) ?? [];

        const transformed = {
            bookingId: booking.id,

            clientUserId: clientUser?.id ?? null,
            clientName: clientUser?.name ?? null,
            clientProfileId: booking.client?.id ?? null,

            doulaUserId: doulaUser?.id ?? null,
            doulaName: doulaUser?.name ?? null,
            doulaProfileId: booking.DoulaProfile?.id ?? null,

            regionName: booking.region?.regionName ?? null,

            serviceName,
            start_date: startDate,
            end_date: endDate,
            timeSlots,
            status: booking.status,
            createdAt: booking.createdAt,
        };

        return {
            message: 'Booking fetched successfully',
            data: transformed,
        };
    }

}
