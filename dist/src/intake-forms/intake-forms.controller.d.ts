import { IntakeFormService } from './intake-forms.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
export declare class IntakeFormController {
    private readonly intakeService;
    constructor(intakeService: IntakeFormService);
    create(dto: IntakeFormDto): Promise<void>;
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
            servicePrice: import("@prisma/client/runtime/library").JsonValue;
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
        servicePrice: import("@prisma/client/runtime/library").JsonValue;
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
    BookDoula(dto: BookDoulaDto, req: any): Promise<void>;
}
