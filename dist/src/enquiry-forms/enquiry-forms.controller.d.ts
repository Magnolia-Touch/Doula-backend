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
                serviceName: string;
                createdAt: Date;
                updatedAt: Date;
                serviceId: string | null;
                link: string;
                status: import("@prisma/client").$Enums.MeetingStatus;
                startTime: Date;
                endTime: Date;
                date: Date;
                remarks: string | null;
                bookedById: string;
                cancelledAt: Date | null;
                rescheduledAt: Date | null;
                availableSlotsForMeetingId: string | null;
                zoneManagerProfileId: string | null;
                doulaProfileId: string | null;
                adminProfileId: string | null;
                enquiryId: string | null;
            } | null;
        } & {
            id: string;
            name: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            VisitFrequency: number | null;
            serviceTimeSlots: string | null;
            serviceName: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            slotId: string;
            serviceId: string;
            clientId: string;
        }) | null;
    }>;
    getAllEnquiries(page: string | undefined, limit: string | undefined, req: any): Promise<{
        data: {
            id: string;
            name: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            VisitFrequency: number | null;
            serviceTimeSlots: string | null;
            serviceName: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            slotId: string;
            serviceId: string;
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
    getEnquiryById(id: string, req: any): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        additionalNotes: string | null;
        meetingsDate: Date;
        meetingsTimeSlots: string;
        seviceStartDate: Date | null;
        serviceEndDate: Date | null;
        VisitFrequency: number | null;
        serviceTimeSlots: string | null;
        serviceName: string;
        createdAt: Date;
        updatedAt: Date;
        regionId: string;
        slotId: string;
        serviceId: string;
        clientId: string;
        Meetings: {
            id: string;
            serviceName: string;
            createdAt: Date;
            updatedAt: Date;
            serviceId: string | null;
            link: string;
            status: import("@prisma/client").$Enums.MeetingStatus;
            startTime: Date;
            endTime: Date;
            date: Date;
            remarks: string | null;
            bookedById: string;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            doulaProfileId: string | null;
            adminProfileId: string | null;
            enquiryId: string | null;
        } | null;
    }>;
    deleteEnquiry(id: string): Promise<{
        message: string;
    }>;
    deleteallEnquiry(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
