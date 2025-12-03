import { AnalyticsService } from './analytics.service';
import { FilterUserDto } from './filter-user.dto';
export declare class AnalyticsController {
    private service;
    constructor(service: AnalyticsService);
    listUsers(query: FilterUserDto): Promise<{
        data: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
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
    getCounts(): Promise<{
        total: number;
        clients: number;
        doulas: number;
        zonemanagers: number;
        admins: number;
    }>;
    ActivegetCounts(): Promise<{
        total: number;
        clients: number;
        doulas: number;
        zonemanagers: number;
        admins: number;
    }>;
    inactivegetCounts(): Promise<{
        total: number;
        clients: number;
        doulas: number;
        zonemanagers: number;
        admins: number;
    }>;
    getStats(): Promise<{
        FormattedCounts: {
            ACTIVE: number;
            COMPLETED: number;
            CANCELED: number;
        };
    }>;
    getMeetigStats(): Promise<{
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
}
