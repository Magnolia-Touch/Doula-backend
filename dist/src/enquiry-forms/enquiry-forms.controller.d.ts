import { EnquiryService } from './enquiry-forms.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
export declare class EnquiryController {
    private readonly enquiryService;
    constructor(enquiryService: EnquiryService);
    submit(dto: EnquiryFormDto): Promise<{
        message: string;
        enquiry: {
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
            additionalNotes: string | null;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            VisitFrequency: number | null;
            serviceTimeSlots: string | null;
            slotId: string;
        };
    }>;
    getAllEnquiries(page?: string, limit?: string): Promise<{
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
            additionalNotes: string | null;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            VisitFrequency: number | null;
            serviceTimeSlots: string | null;
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
        email: string;
        phone: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        regionId: string;
        serviceId: string;
        serviceName: string;
        additionalNotes: string | null;
        meetingsDate: Date;
        meetingsTimeSlots: string;
        seviceStartDate: Date | null;
        serviceEndDate: Date | null;
        VisitFrequency: number | null;
        serviceTimeSlots: string | null;
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
