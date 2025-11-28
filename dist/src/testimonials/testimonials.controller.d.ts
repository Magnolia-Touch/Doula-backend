import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { FilterTestimonialsDto } from './dto/filter-testimonials.dto';
export declare class TestimonialsController {
    private readonly service;
    constructor(service: TestimonialsService);
    create(dto: CreateTestimonialDto, req: any): Promise<{
        serviceId: string;
        id: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
    findAll(query: FilterTestimonialsDto): Promise<{
        data: {
            serviceId: string;
            id: string;
            doulaProfileId: string;
            clientId: string;
            ratings: number;
            reviews: string;
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
    findOne(id: string): Promise<{
        serviceId: string;
        id: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
    update(id: string, dto: UpdateTestimonialDto, req: any): Promise<{
        serviceId: string;
        id: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
    remove(id: string, req: any): Promise<{
        serviceId: string;
        id: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
}
