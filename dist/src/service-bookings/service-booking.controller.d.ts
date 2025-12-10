import { ServiceBookingService } from './service-booking.service';
export declare class ServiceBookingController {
    private readonly bookingService;
    constructor(bookingService: ServiceBookingService);
    findAll(query: {
        page?: string;
        limit?: string;
        status?: string;
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
    getBookingById(id: string): Promise<{
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
}
