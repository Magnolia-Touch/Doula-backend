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
            date: Date;
            regionId: string;
            address: string;
            doulaProfileId: string;
            clientId: string;
            servicePricingId: string;
        };
        booking: {
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
            date: Date;
            regionId: string;
            address: string;
            doulaProfileId: string;
            clientId: string;
            servicePricingId: string;
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
            availabe: boolean;
            isBooked: boolean;
            date: Date;
            weekday: string;
            doulaId: string;
        }[];
    } & {
        id: string;
        name: string | null;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        regionId: string;
        address: string;
        doulaProfileId: string;
        clientId: string;
        servicePricingId: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    deleteallEnquiry(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
