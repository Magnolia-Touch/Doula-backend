import { EnquiryService } from './enquiry-forms.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
export declare class EnquiryController {
    private readonly enquiryService;
    constructor(enquiryService: EnquiryService);
    submit(dto: EnquiryFormDto): Promise<{
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
    getAllEnquiries(page: string | undefined, limit: string | undefined, req: any): Promise<{
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
    getEnquiryById(id: string, req: any): Promise<{
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
    deleteallEnquiry(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
