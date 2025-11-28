import { PrismaService } from '../prisma/prisma.service';
import { FilterUserDto } from './filter-user.dto';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    listUsers(query: FilterUserDto): Promise<{
        data: {
            role: import("@prisma/client").$Enums.Role;
            id: string;
            name: string;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    countUsersByRole(): Promise<{
        total: number;
        clients: number;
        doulas: number;
        zonemanagers: number;
        admins: number;
    }>;
    getBookingStats(): Promise<{
        totalBookings: number;
        totalRevenue: number;
    }>;
}
