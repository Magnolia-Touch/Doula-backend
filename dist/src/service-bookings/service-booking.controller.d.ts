import { ServiceBookingService } from './service-booking.service';
export declare class ServiceBookingController {
    private readonly bookingService;
    constructor(bookingService: ServiceBookingService);
    getAllBookings(): Promise<({
        DoulaProfile: {
            id: string;
            regionId: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
        };
        service: {
            id: string;
            doulaProfileId: string;
            createdAt: Date;
            updatedAt: Date;
            serviceId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        };
        client: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
            address: string | null;
        };
        region: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionName: string;
            pincode: string;
            district: string;
            state: string;
            country: string;
            latitude: string;
            longitude: string;
            is_active: boolean;
            zoneManagerId: string | null;
        };
        slot: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            availabe: boolean;
            dateId: string;
        } | null;
        AvailableSlotsForService: {
            id: string;
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            availabe: boolean;
            weekday: string;
            isBooked: boolean;
            doulaId: string;
        };
    } & {
        id: string;
        date: Date;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
        regionId: string;
        servicePricingId: string;
        doulaProfileId: string;
        clientId: string;
        slotTimeId: string | null;
        slotId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getBookingById(id: string): Promise<{
        DoulaProfile: {
            id: string;
            regionId: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
        };
        service: {
            id: string;
            doulaProfileId: string;
            createdAt: Date;
            updatedAt: Date;
            serviceId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        };
        client: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
            address: string | null;
        };
        region: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionName: string;
            pincode: string;
            district: string;
            state: string;
            country: string;
            latitude: string;
            longitude: string;
            is_active: boolean;
            zoneManagerId: string | null;
        };
        slot: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            availabe: boolean;
            dateId: string;
        } | null;
        AvailableSlotsForService: {
            id: string;
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            availabe: boolean;
            weekday: string;
            isBooked: boolean;
            doulaId: string;
        };
    } & {
        id: string;
        date: Date;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
        regionId: string;
        servicePricingId: string;
        doulaProfileId: string;
        clientId: string;
        slotTimeId: string | null;
        slotId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
