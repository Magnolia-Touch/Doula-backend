import { PrismaService } from '../prisma/prisma.service';
import { FilterUserDto } from './filter-user.dto';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    listUsers(query: FilterUserDto): Promise<{
        data: {
            id: string;
            email: string;
            phone: string | null;
            name: string;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
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
    ActivecountUsersByRole(): Promise<{
        total: number;
        clients: number;
        doulas: number;
        zonemanagers: number;
        admins: number;
    }>;
    inactivecountUsersByRole(): Promise<{
        total: number;
        clients: number;
        doulas: number;
        zonemanagers: number;
        admins: number;
    }>;
    getBookingStats(): Promise<{
        FormattedCounts: {
            ACTIVE: number;
            COMPLETED: number;
            CANCELED: number;
        };
    }>;
    getMeetingstats(): Promise<{
        SCHEDULED: number;
        COMPLETED: number;
        CANCELED: number;
    }>;
    getDailyActivity(startDate?: string, endDate?: string): Promise<{
        date: string;
        weekday: string;
        noOfBookings: number;
        noOfMeetings: number;
    }[]>;
    calenderSummary(userId: string, startDate: string, endDate: string): Promise<{
        data: {
            date: string;
            appointmentCount: number;
            scheduleCount: number;
        }[];
    }>;
}
