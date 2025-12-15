import { EnquiryService } from './enquiry-forms.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
export declare class EnquiryController {
    private readonly enquiryService;
    constructor(enquiryService: EnquiryService);
    submit(dto: EnquiryFormDto): Promise<{
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
    getAllEnquiries(page?: string, limit?: string): Promise<{
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
    deleteallEnquiry(): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
