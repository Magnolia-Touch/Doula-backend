import { PrismaService } from 'src/prisma/prisma.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
import { MailerService } from '@nestjs-modules/mailer';
export declare class IntakeFormService {
    private readonly prisma;
    private readonly mail;
    constructor(prisma: PrismaService, mail: MailerService);
    createIntakeForm(dto: IntakeFormDto): Promise<{
        intake: {
            id: string;
            name: string | null;
            email: string | null;
            phone: string | null;
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
    }>;
    getAllForms(page: number, limit: number): Promise<{
        data: {
            id: string;
            name: string | null;
            email: string | null;
            phone: string | null;
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
    getFormById(id: string): Promise<{
        clientProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            is_verified: boolean;
            region: string | null;
            address: string | null;
            profile_image: string | null;
            userId: string;
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
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            regionId: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: import("@prisma/client/runtime/library").JsonValue | null;
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
        }[];
    } & {
        id: string;
        name: string | null;
        email: string | null;
        phone: string | null;
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
    }>;
    deleteForm(id: string): Promise<{
        message: string;
    }>;
    deleteAllIntakeForms(): Promise<{
        message: string;
        deletedCount: number;
    }>;
    BookDoula(dto: BookDoulaDto, userId: string): Promise<{
        intake: {
            id: string;
            name: string | null;
            email: string | null;
            phone: string | null;
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
    }>;
}
