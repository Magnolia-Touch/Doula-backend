import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
export declare class ServiceBookingService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
        page?: number;
        limit?: number;
        status?: any;
    }): Promise<{
        data: {
            bookingId: any;
            clientUserId: any;
            clientName: any;
            clientProfileId: any;
            doulaUserId: any;
            doulaName: any;
            doulaProfileId: any;
            regionName: any;
            serviceName: any;
            start_date: any;
            end_date: any;
            timeSlots: any;
            status: any;
            createdAt: any;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
        message: string;
    }>;
    findById(id: string): Promise<{
        message: string;
        data: {
            bookingId: string;
            clientUserId: string;
            clientName: string;
            clientProfileId: string;
            doulaUserId: string;
            doulaName: string;
            doulaProfileId: string;
            regionName: string;
            serviceName: string;
            start_date: Date;
            end_date: Date;
            timeSlots: {
                id: any;
                startTime: any;
                endTime: any;
            }[];
            status: import("@prisma/client").$Enums.BookingStatus;
            createdAt: Date;
        };
    }>;
    updateScheduleStatus(userId: string, scheduleId: string, dto: UpdateScheduleStatusDto): Promise<{
        message: string;
        scheduleId: string;
        status: import("@prisma/client").$Enums.ServiceStatus;
    }>;
}
