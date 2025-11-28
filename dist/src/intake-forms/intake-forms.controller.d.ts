import { IntakeFormService } from './intake-forms.service';
import { IntakeFormDto } from './dto/intake-form.dto';
export declare class IntakeFormController {
    private readonly intakeService;
    constructor(intakeService: IntakeFormService);
    create(dto: IntakeFormDto): Promise<{
        intake: {
            name: string | null;
            email: string | null;
            phone: string | null;
            slotId: string;
            doulaProfileId: string;
            address: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            regionId: string;
            servicePricingId: string;
            clientId: string;
            slotTimeId: string | null;
        };
        booking: {
            slotId: string;
            doulaProfileId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            regionId: string;
            servicePricingId: string;
            clientId: string;
            slotTimeId: string | null;
            paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    getAll(page?: number, limit?: number): Promise<{
        data: {
            name: string | null;
            email: string | null;
            phone: string | null;
            slotId: string;
            doulaProfileId: string;
            address: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            regionId: string;
            servicePricingId: string;
            clientId: string;
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
            address: string | null;
            id: string;
            userId: string;
            profile_image: string | null;
            createdAt: Date;
            updatedAt: Date;
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
        DoulaProfile: {
            id: string;
            userId: string;
            profile_image: string | null;
            createdAt: Date;
            updatedAt: Date;
            regionId: string | null;
        };
        service: {
            doulaProfileId: string;
            serviceId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
        };
        slot: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            weekday: string;
            availabe: boolean;
            isBooked: boolean;
            doulaId: string;
        };
    } & {
        name: string | null;
        email: string | null;
        phone: string | null;
        slotId: string;
        doulaProfileId: string;
        address: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        regionId: string;
        servicePricingId: string;
        clientId: string;
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
