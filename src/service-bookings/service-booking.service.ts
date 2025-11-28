import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceBookingService {
    constructor(private prisma: PrismaService) { }

    // Fetch all bookings
    async findAll() {
        return this.prisma.serviceBooking.findMany({
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
