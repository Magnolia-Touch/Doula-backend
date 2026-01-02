import { EnquiryService } from './enquiry-forms.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
export declare class EnquiryController {
    private readonly enquiryService;
    constructor(enquiryService: EnquiryService);
    submit(dto: EnquiryFormDto): Promise<{
        message: string;
        enquiry: ({
            Meetings: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                link: string;
                serviceId: string | null;
                doulaProfileId: string | null;
                startTime: Date;
                endTime: Date;
                date: Date;
                status: import("@prisma/client").$Enums.MeetingStatus;
                serviceName: string;
                remarks: string | null;
                bookedById: string;
                cancelledAt: Date | null;
                rescheduledAt: Date | null;
                availableSlotsForMeetingId: string | null;
                zoneManagerProfileId: string | null;
                adminProfileId: string | null;
                enquiryId: string | null;
            } | null;
        } & {
            id: string;
            email: string;
            phone: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            serviceId: string;
            clientId: string;
            serviceName: string;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            serviceTimeSlots: string | null;
            additionalNotes: string | null;
            VisitFrequency: number | null;
            slotId: string;
        }) | null;
    }>;
    getAllEnquiries(page: string | undefined, limit: string | undefined, req: any): Promise<{
        data: {
            id: string;
            email: string;
            phone: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            serviceId: string;
            clientId: string;
            serviceName: string;
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
    getEnquiryById(id: string, req: any): Promise<{
        id: string;
        email: string;
        phone: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        regionId: string;
        serviceId: string;
        Meetings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            link: string;
            serviceId: string | null;
            doulaProfileId: string | null;
            startTime: Date;
            endTime: Date;
            date: Date;
            status: import("@prisma/client").$Enums.MeetingStatus;
            serviceName: string;
            remarks: string | null;
            bookedById: string;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            adminProfileId: string | null;
            enquiryId: string | null;
        } | null;
        clientId: string;
        serviceName: string;
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
    deleteallEnquiry(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
