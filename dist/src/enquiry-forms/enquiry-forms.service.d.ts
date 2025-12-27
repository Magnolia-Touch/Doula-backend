import { PrismaService } from 'src/prisma/prisma.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { MeetingsService } from 'src/meetings/meetings.service';
export declare class EnquiryService {
    private readonly prisma;
    private readonly mail;
    private readonly schedule;
    constructor(prisma: PrismaService, mail: MailerService, schedule: MeetingsService);
    submitEnquiry(data: EnquiryFormDto): Promise<{
        message: string;
        enquiry: {
            id: string;
            name: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            meetingsId: string | null;
            serviceName: string;
            serviceId: string;
            clientId: string;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            serviceTimeSlots: string | null;
            additionalNotes: string | null;
            VisitFrequency: number | null;
            slotId: string;
        };
    }>;
    getAllEnquiries(page: number | undefined, limit: number | undefined, userId: string): Promise<{
        data: {
            id: string;
            name: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            meetingsId: string | null;
            serviceName: string;
            serviceId: string;
            clientId: string;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            serviceTimeSlots: string | null;
            additionalNotes: string | null;
            VisitFrequency: number | null;
            slotId: string;
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
    getEnquiryById(id: string, userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        regionId: string;
        meetingsId: string | null;
        serviceName: string;
        serviceId: string;
        clientId: string;
        meetingsDate: Date;
        meetingsTimeSlots: string;
        seviceStartDate: Date | null;
        serviceEndDate: Date | null;
        serviceTimeSlots: string | null;
        additionalNotes: string | null;
        VisitFrequency: number | null;
        slotId: string;
    }>;
    deleteEnquiry(id: string): Promise<{
        message: string;
    }>;
    deleteAllEnquiryForms(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
