import { IntakeFormService } from './intake-forms.service';
import { IntakeFormDto } from './dto/intake-form.dto';
export declare class IntakeFormController {
    private readonly intakeService;
    constructor(intakeService: IntakeFormService);
    create(dto: IntakeFormDto): Promise<{
        intake: {
            id: string;
            name: string | null;
            email: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            address: string;
            doulaProfileId: string;
            date: Date;
            slotId: string;
            clientId: string;
            servicePricingId: string;
            slotTimeId: string | null;
        };
        booking: {
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
        };
    }>;
    getAll(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string | null;
            email: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            address: string;
            doulaProfileId: string;
            date: Date;
            slotId: string;
            clientId: string;
            servicePricingId: string;
            slotTimeId: string | null;
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
    get(id: string): Promise<{
        clientProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string;
            address: string | null;
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
            date: Date;
            weekday: string;
            availabe: boolean;
            doulaId: string;
            isBooked: boolean;
        };
    } & {
        id: string;
        name: string | null;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        regionId: string;
        address: string;
        doulaProfileId: string;
        date: Date;
        slotId: string;
        clientId: string;
        servicePricingId: string;
        slotTimeId: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    deleteallEnquiry(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
