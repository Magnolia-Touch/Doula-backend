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
            regionId: string;
            slotId: string;
            serviceId: string;
            name: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clientId: string | null;
            availableSlotsForMeetingId: string | null;
        };
    }>;
    getAllEnquiries(page?: number, limit?: number): Promise<{
        data: {
            regionId: string;
            slotId: string;
            serviceId: string;
            name: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clientId: string | null;
            availableSlotsForMeetingId: string | null;
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
        region: {
            id: string;
            pincode: string;
            regionName: string;
            district: string;
            state: string;
            country: string;
            latitude: string;
            longitude: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
            zoneManagerId: string | null;
        };
        service: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        slot: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            availabe: boolean;
            isBooked: boolean;
            dateId: string;
        };
    } & {
        regionId: string;
        slotId: string;
        serviceId: string;
        name: string;
        email: string;
        phone: string;
        additionalNotes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string | null;
        availableSlotsForMeetingId: string | null;
    }>;
    deleteEnquiry(id: string): Promise<{
        message: string;
    }>;
    deleteAllEnquiryForms(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
