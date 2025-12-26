import { PrismaService } from 'src/prisma/prisma.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Prisma } from '@prisma/client';
export declare class IntakeFormService {
    private readonly prisma;
    private readonly mail;
    constructor(prisma: PrismaService, mail: MailerService);
    private ensureHttpsUrl;
    private getDefaultUrl;
    createIntakeForm(dto: IntakeFormDto): Promise<void>;
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
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            doulaId: string;
            createdAt: Date;
            updatedAt: Date;
            isBooked: boolean;
        }[];
        slotTimes: {
            id: string;
            availabe: boolean;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            isBooked: boolean;
            dateId: string;
            bookingId: string | null;
            formId: string | null;
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
    BookDoula(dto: BookDoulaDto, userId: string): Promise<void>;
}
