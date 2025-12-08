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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            doulaProfileId: string;
            date: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
            servicePricingId: string;
            clientId: string;
            paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
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
    getBookingById(id: string): Promise<{
        AvailableSlotsForService: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            weekday: string;
            availabe: boolean;
            doulaId: string;
            isBooked: boolean;
        }[];
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
        };
        region: {
            id: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
            regionName: string;
            pincode: string;
            district: string;
            state: string;
            country: string;
            latitude: string;
            longitude: string;
            zoneManagerId: string | null;
        };
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            serviceId: string;
            doulaProfileId: string;
        };
        slot: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            availabe: boolean;
            startTime: Date;
            endTime: Date;
            isBooked: boolean;
            dateId: string;
            formId: string | null;
            bookingId: string | null;
        }[];
        client: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            address: string | null;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        regionId: string;
        doulaProfileId: string;
        date: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        servicePricingId: string;
        clientId: string;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
