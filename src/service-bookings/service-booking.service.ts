import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'src/common/utility/pagination.util';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceBookingService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: { page?: number; limit?: number; status?: any }) {
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 10;

        // Optional: Add filtering logic here if needed
        const where: any = {};
        if (query.status) {
            where.status = query.status;
        }

        return paginate({
            prismaModel: this.prisma.serviceBooking,
            page,
            limit,
            where, // Applies filters if any exist
            orderBy: { createdAt: 'desc' }, // Recommended: Show newest bookings first
            include: {
                DoulaProfile: true,
                service: true,
                client: true,
                region: true,
                slot: true,
                AvailableSlotsForService: true,
            },
        });
    }

    // Fetch booking by ID
    async findById(id: string) {
        const booking = await this.prisma.serviceBooking.findUnique({
            where: { id },
            include: {
                DoulaProfile: true,
                service: true,
                client: true,
                region: true,
                slot: true,
                AvailableSlotsForService: true,
            },
        });

        if (!booking) {
            throw new NotFoundException('Service booking not found');
        }

        return booking;
    }
}
