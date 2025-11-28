import { PrismaService } from 'src/prisma/prisma.service';
export declare class ServiceBookingService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
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
        };
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string;
            regionId: string | null;
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
        slotId: string;
        doulaProfileId: string;
        clientId: string;
        servicePricingId: string;
        slotTimeId: string | null;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
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
        };
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string;
            regionId: string | null;
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
        slotId: string;
        doulaProfileId: string;
        clientId: string;
        servicePricingId: string;
        slotTimeId: string | null;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
