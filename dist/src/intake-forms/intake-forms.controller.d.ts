import { IntakeFormService } from './intake-forms.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
export declare class IntakeFormController {
    private readonly intakeService;
    constructor(intakeService: IntakeFormService);
    create(dto: IntakeFormDto): Promise<{
        intake: {
            id: string;
            date: Date;
            location: string | null;
            name: string | null;
            email: string | null;
            phone: string | null;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            servicePricingId: string;
            doulaProfileId: string;
            clientId: string;
        };
        booking: {
            id: string;
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            servicePricingId: string;
            doulaProfileId: string;
            clientId: string;
            paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
            status: import("@prisma/client").$Enums.BookingStatus;
        };
    }>;
    getAll(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            date: Date;
            location: string | null;
            name: string | null;
            email: string | null;
            phone: string | null;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            servicePricingId: string;
            doulaProfileId: string;
            clientId: string;
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
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            doulaProfileId: string;
            serviceId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        };
        clientProfile: {
            id: string;
            address: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            is_verified: boolean;
            profile_image: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            regionId: string | null;
            userId: string;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: import("@prisma/client/runtime/library").JsonValue | null;
        };
        slot: {
            id: string;
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            weekday: string;
            availabe: boolean;
            isBooked: boolean;
            doulaId: string;
        }[];
    } & {
        id: string;
        date: Date;
        location: string | null;
        name: string | null;
        email: string | null;
        phone: string | null;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        regionId: string;
        servicePricingId: string;
        doulaProfileId: string;
        clientId: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    deleteallEnquiry(): Promise<{
        message: string;
        deletedCount: number;
    }>;
    BookDoula(dto: BookDoulaDto, req: any): Promise<{
        intake: {
            id: string;
            date: Date;
            location: string | null;
            name: string | null;
            email: string | null;
            phone: string | null;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            servicePricingId: string;
            doulaProfileId: string;
            clientId: string;
        };
        booking: {
            id: string;
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            servicePricingId: string;
            doulaProfileId: string;
            clientId: string;
            paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
            status: import("@prisma/client").$Enums.BookingStatus;
        };
    }>;
}
