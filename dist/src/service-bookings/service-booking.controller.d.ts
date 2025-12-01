import { ServiceBookingService } from './service-booking.service';
export declare class ServiceBookingController {
    private readonly bookingService;
    constructor(bookingService: ServiceBookingService);
    getAllBookings(): Promise<({
        AvailableSlotsForService: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            weekday: string;
            availabe: boolean;
            doulaId: string;
            isBooked: boolean;
        };
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string;
            regionId: string | null;
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
            dateId: string;
        } | null;
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
        regionId: string;
        doulaProfileId: string;
        date: Date;
        slotId: string;
        clientId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        servicePricingId: string;
        slotTimeId: string | null;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
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
        };
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string;
            regionId: string | null;
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
            dateId: string;
        } | null;
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
        regionId: string;
        doulaProfileId: string;
        date: Date;
        slotId: string;
        clientId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        servicePricingId: string;
        slotTimeId: string | null;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
