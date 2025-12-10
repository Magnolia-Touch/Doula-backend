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
            serviceId: string;
            slotId: string;
            availableSlotsForMeetingId: string | null;
            clientId: string | null;
            startDate: string;
            endDate: string;
            additionalNotes: string | null;
            VisitFrequency: number;
            TimeSlots: string;
        };
    }>;
    getAllEnquiries(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            serviceId: string;
            slotId: string;
            availableSlotsForMeetingId: string | null;
            clientId: string | null;
            startDate: string;
            endDate: string;
            additionalNotes: string | null;
            VisitFrequency: number;
            TimeSlots: string;
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
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        slot: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            availabe: boolean;
            startTime: Date;
            endTime: Date;
            isBooked: boolean;
            dateId: string;
        };
    } & {
        id: string;
        name: string;
        email: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        regionId: string;
        serviceId: string;
        slotId: string;
        availableSlotsForMeetingId: string | null;
        clientId: string | null;
        startDate: string;
        endDate: string;
        additionalNotes: string | null;
        VisitFrequency: number;
        TimeSlots: string;
    }>;
    deleteEnquiry(id: string): Promise<{
        message: string;
    }>;
    deleteAllEnquiryForms(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
