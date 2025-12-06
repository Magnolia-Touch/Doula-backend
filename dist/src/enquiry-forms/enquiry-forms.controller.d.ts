import { EnquiryService } from './enquiry-forms.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
export declare class EnquiryController {
    private readonly enquiryService;
    constructor(enquiryService: EnquiryService);
    submit(dto: EnquiryFormDto): Promise<{
        message: string;
        enquiry: {
            id: string;
            name: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            startDate: string;
            endDate: string;
            VisitFrequency: number;
            TimeSlots: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            slotId: string;
            serviceId: string;
            clientId: string | null;
            availableSlotsForMeetingId: string | null;
        };
    }>;
    getAllEnquiries(page?: string, limit?: string): Promise<{
        data: {
            id: string;
            name: string;
            email: string;
            phone: string;
            additionalNotes: string | null;
            startDate: string;
            endDate: string;
            VisitFrequency: number;
            TimeSlots: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string;
            slotId: string;
            serviceId: string;
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
            createdAt: Date;
            updatedAt: Date;
            regionName: string;
            pincode: string;
            district: string;
            state: string;
            country: string;
            latitude: string;
            longitude: string;
            is_active: boolean;
            zoneManagerId: string | null;
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
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        id: string;
        name: string;
        email: string;
        phone: string;
        additionalNotes: string | null;
        startDate: string;
        endDate: string;
        VisitFrequency: number;
        TimeSlots: string;
        createdAt: Date;
        updatedAt: Date;
        regionId: string;
        slotId: string;
        serviceId: string;
        clientId: string | null;
        availableSlotsForMeetingId: string | null;
    }>;
    deleteEnquiry(id: string): Promise<{
        message: string;
    }>;
    deleteallEnquiry(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
