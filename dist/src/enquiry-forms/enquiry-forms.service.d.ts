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
        enquiry: ({
            Meetings: {
                enquiryId: string | null;
                date: Date;
                serviceName: string;
                status: import("@prisma/client").$Enums.MeetingStatus;
                id: string;
                link: string;
                startTime: Date;
                endTime: Date;
                remarks: string | null;
                createdAt: Date;
                updatedAt: Date;
                cancelledAt: Date | null;
                rescheduledAt: Date | null;
                bookedById: string;
                availableSlotsForMeetingId: string | null;
                zoneManagerProfileId: string | null;
                doulaProfileId: string | null;
                adminProfileId: string | null;
                serviceId: string | null;
            } | null;
        } & {
            serviceName: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            serviceId: string;
            name: string;
            regionId: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            VisitFrequency: number | null;
            serviceTimeSlots: string | null;
            slotId: string;
            clientId: string;
        }) | null;
    }>;
    getAllEnquiries(page: number | undefined, limit: number | undefined, userId: string): Promise<{
        data: {
            serviceName: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            serviceId: string;
            name: string;
            regionId: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            VisitFrequency: number | null;
            serviceTimeSlots: string | null;
            slotId: string;
            clientId: string;
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
        serviceName: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        name: string;
        Meetings: {
            enquiryId: string | null;
            date: Date;
            serviceName: string;
            status: import("@prisma/client").$Enums.MeetingStatus;
            id: string;
            link: string;
            startTime: Date;
            endTime: Date;
            remarks: string | null;
            createdAt: Date;
            updatedAt: Date;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            bookedById: string;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            doulaProfileId: string | null;
            adminProfileId: string | null;
            serviceId: string | null;
        } | null;
        regionId: string;
        email: string;
        phone: string;
        additionalNotes: string | null;
        meetingsDate: Date;
        meetingsTimeSlots: string;
        seviceStartDate: Date | null;
        serviceEndDate: Date | null;
        VisitFrequency: number | null;
        serviceTimeSlots: string | null;
        slotId: string;
        clientId: string;
    }>;
    deleteEnquiry(id: string): Promise<{
        message: string;
    }>;
    deleteAllEnquiryForms(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
