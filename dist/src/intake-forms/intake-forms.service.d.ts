import { PrismaService } from 'src/prisma/prisma.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Prisma } from '@prisma/client';
export declare class IntakeFormService {
    private readonly prisma;
    private readonly mail;
    constructor(prisma: PrismaService, mail: MailerService);
    createIntakeForm(dto: IntakeFormDto): Promise<{
        intake: {
            name: string | null;
            id: string;
            startDate: Date;
            endDate: Date;
            location: string | null;
            email: string | null;
            phone: string | null;
            address: string;
            regionId: string;
            servicePricingId: string;
            doulaProfileId: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        booking: {
            id: string;
            startDate: Date;
            endDate: Date;
            regionId: string;
            servicePricingId: string;
            doulaProfileId: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            paymentDetails: Prisma.JsonValue | null;
            status: import("@prisma/client").$Enums.BookingStatus;
            cancelledAt: Date | null;
        };
        schedulesCreated: number;
    }>;
    getAllForms(page: number, limit: number): Promise<{
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
            servicePrice: Prisma.Decimal;
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
    getFormById(id: string): Promise<{
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
        servicePrice: Prisma.Decimal;
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
            isBooked: boolean;
            doulaId: string;
        }[];
        slotTimes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            availabe: boolean;
            isBooked: boolean;
            startTime: Date;
            endTime: Date;
            formId: string | null;
            bookingId: string | null;
            dateId: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
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
            name: string | null;
            id: string;
            startDate: Date;
            endDate: Date;
            location: string | null;
            email: string | null;
            phone: string | null;
            address: string;
            regionId: string;
            servicePricingId: string;
            doulaProfileId: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        booking: {
            id: string;
            startDate: Date;
            endDate: Date;
            regionId: string;
            servicePricingId: string;
            doulaProfileId: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            paymentDetails: Prisma.JsonValue | null;
            status: import("@prisma/client").$Enums.BookingStatus;
            cancelledAt: Date | null;
        };
        schedulesCreated: number;
    }>;
}
