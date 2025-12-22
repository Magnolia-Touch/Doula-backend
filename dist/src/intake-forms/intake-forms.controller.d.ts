import { IntakeFormService } from './intake-forms.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
export declare class IntakeFormController {
    private readonly intakeService;
    constructor(intakeService: IntakeFormService);
    create(dto: IntakeFormDto): Promise<{
        intake: {
            id: string;
            email: string | null;
            phone: string | null;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            regionId: string;
            doulaProfileId: string;
            startDate: Date;
            endDate: Date;
            servicePricingId: string;
            clientId: string;
            location: string | null;
        };
        booking: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            doulaProfileId: string;
            startDate: Date;
            endDate: Date;
            paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
            status: import("@prisma/client").$Enums.BookingStatus;
            cancelledAt: Date | null;
            servicePricingId: string;
            clientId: string;
        };
        schedulesCreated: number;
    }>;
    getAll(page?: number, limit?: number): Promise<{
        data: {
            intakeFormId: string;
            serviceStartDate: Date;
            serviceEndDate: Date;
            location: string | null;
            clientName: string;
            clientEmail: string;
            clientPhone: string | null;
            regionName: string;
            serviceName: string;
            servicePrice: import("@prisma/client/runtime/library").Decimal;
            clientId: string;
            clientProfileId: string;
            userId: string;
            doulaProfileId: string;
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
        intakeFormId: string;
        serviceStartDate: Date;
        serviceEndDate: Date;
        location: string | null;
        address: string;
        clientName: string;
        clientEmail: string;
        clientPhone: string | null;
        regionName: string;
        serviceName: string;
        servicePrice: import("@prisma/client/runtime/library").Decimal;
        clientId: string;
        clientProfileId: string;
        userId: string;
        doulaProfileId: string;
        slots: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            doulaId: string;
            isBooked: boolean;
        }[];
        slotTimes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            bookingId: string | null;
            availabe: boolean;
            isBooked: boolean;
            dateId: string;
            formId: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
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
            email: string | null;
            phone: string | null;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            regionId: string;
            doulaProfileId: string;
            startDate: Date;
            endDate: Date;
            servicePricingId: string;
            clientId: string;
            location: string | null;
        };
        booking: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            doulaProfileId: string;
            startDate: Date;
            endDate: Date;
            paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
            status: import("@prisma/client").$Enums.BookingStatus;
            cancelledAt: Date | null;
            servicePricingId: string;
            clientId: string;
        };
        schedulesCreated: number;
    }>;
}
