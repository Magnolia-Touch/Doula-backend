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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            regionId: string;
            email: string;
            phone: string;
            serviceName: string;
            serviceId: string;
            clientId: string;
            additionalNotes: string | null;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date;
            serviceEndDate: Date;
            VisitFrequency: number;
            serviceTimeSlots: string;
            slotId: string;
        };
    }>;
    getAllEnquiries(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            regionId: string;
            email: string;
            phone: string;
            serviceName: string;
            serviceId: string;
            clientId: string;
            additionalNotes: string | null;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date;
            serviceEndDate: Date;
            VisitFrequency: number;
            serviceTimeSlots: string;
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
    getEnquiryById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        regionId: string;
        email: string;
        phone: string;
        serviceName: string;
        serviceId: string;
        additionalNotes: string | null;
        meetingsDate: Date;
        meetingsTimeSlots: string;
        seviceStartDate: Date;
        serviceEndDate: Date;
        VisitFrequency: number;
        serviceTimeSlots: string;
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
