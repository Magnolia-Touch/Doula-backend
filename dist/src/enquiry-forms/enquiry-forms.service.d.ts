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
            slotId: string;
            availableSlotsForMeetingId: string | null;
            serviceId: string;
            name: string;
            regionId: string;
            startDate: string;
            endDate: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            VisitFrequency: number;
            TimeSlots: string;
            clientId: string | null;
        };
    }>;
    getAllEnquiries(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slotId: string;
            availableSlotsForMeetingId: string | null;
            serviceId: string;
            name: string;
            regionId: string;
            startDate: string;
            endDate: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            VisitFrequency: number;
            TimeSlots: string;
            clientId: string | null;
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
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        };
        region: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            zoneManagerId: string | null;
            is_active: boolean;
            pincode: string;
            regionName: string;
            district: string;
            state: string;
            country: string;
            latitude: string;
            longitude: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slotId: string;
        availableSlotsForMeetingId: string | null;
        serviceId: string;
        name: string;
        regionId: string;
        startDate: string;
        endDate: string;
        email: string;
        phone: string;
        additionalNotes: string | null;
        VisitFrequency: number;
        TimeSlots: string;
        clientId: string | null;
    }>;
    deleteEnquiry(id: string): Promise<{
        message: string;
    }>;
    deleteAllEnquiryForms(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
