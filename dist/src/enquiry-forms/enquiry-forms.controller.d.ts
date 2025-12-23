import { EnquiryService } from './enquiry-forms.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
export declare class EnquiryController {
    private readonly enquiryService;
    constructor(enquiryService: EnquiryService);
    submit(dto: EnquiryFormDto): Promise<{
        message: string;
        enquiry: {
            id: string;
            serviceName: string;
            createdAt: Date;
            updatedAt: Date;
            serviceId: string;
            name: string;
            email: string;
            phone: string;
            regionId: string;
            clientId: string;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            additionalNotes: string | null;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            serviceTimeSlots: string | null;
            VisitFrequency: number | null;
            slotId: string;
        };
    }>;
    getAllEnquiries(page: string | undefined, limit: string | undefined, req: any): Promise<{
        data: {
            id: string;
            serviceName: string;
            createdAt: Date;
            updatedAt: Date;
            serviceId: string;
            name: string;
            email: string;
            phone: string;
            regionId: string;
            clientId: string;
            meetingsDate: Date;
            meetingsTimeSlots: string;
            additionalNotes: string | null;
            seviceStartDate: Date | null;
            serviceEndDate: Date | null;
            serviceTimeSlots: string | null;
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
        serviceName: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        name: string;
        email: string;
        phone: string;
        regionId: string;
        clientId: string;
        meetingsDate: Date;
        meetingsTimeSlots: string;
        additionalNotes: string | null;
        seviceStartDate: Date | null;
        serviceEndDate: Date | null;
        serviceTimeSlots: string | null;
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
