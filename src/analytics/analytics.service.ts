// Number of customer, schedules today, total booking service, total revenue 

// All with filter date rang

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from 'src/common/utility/pagination.util';
import { FilterUserDto } from './filter-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async listUsers(query: FilterUserDto) {
        const { role } = query;

        // Pagination
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 10;

        const where: any = {};

        if (role) where.role = role;

        return paginate({
            prismaModel: this.prisma.user,
            page,
            limit,
            where,
            include: {
                clientProfile: true,
                doulaProfile: true,
                zonemanagerprofile: true,
                adminProfile: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async countUsersByRole() {
        const clients = await this.prisma.user.count({ where: { role: Role.CLIENT } });
        const doulas = await this.prisma.user.count({ where: { role: Role.DOULA } });
        const zonemanagers = await this.prisma.user.count({ where: { role: Role.ZONE_MANAGER } });
        const admins = await this.prisma.user.count({ where: { role: Role.ADMIN } });
        const total = await this.prisma.user.count();

        return {
            total,
            clients,
            doulas,
            zonemanagers,
            admins,
        };
    }

    async getBookingStats() {
        // Total bookings
        const totalBookings = await this.prisma.serviceBooking.count();

        // Total revenue (paymentDetails.amount inside JSON)
        const bookings = await this.prisma.serviceBooking.findMany({
            select: { paymentDetails: true },
        });

        let totalRevenue = 0;

        // for (const b of bookings) {
        //     if (b.paymentDetails && typeof b.paymentDetails.amount === 'number') {
        //         totalRevenue += b.paymentDetails.amount;
        //     }
        // }

        return {
            totalBookings,
            totalRevenue,
        };
    }
}
