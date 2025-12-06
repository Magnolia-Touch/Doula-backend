import { PrismaService } from 'src/prisma/prisma.service';
export declare class ServiceBookingService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
        page?: number;
        limit?: number;
        status?: any;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            regionId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            doulaProfileId: string;
            clientId: string;
            servicePricingId: string;
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
    findById(id: string): Promise<{
        region: {
            id: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
            pincode: string;
            regionName: string;
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
            serviceId: string;
            doulaProfileId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        };
        AvailableSlotsForService: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            availabe: boolean;
            isBooked: boolean;
            date: Date;
            weekday: string;
            doulaId: string;
        }[];
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
        };
        slot: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            availabe: boolean;
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
            userId: string;
            address: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        regionId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        doulaProfileId: string;
        clientId: string;
        servicePricingId: string;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
