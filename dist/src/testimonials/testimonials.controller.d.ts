import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { FilterTestimonialsDto } from './dto/filter-testimonials.dto';
export declare class TestimonialsController {
    private readonly service;
    constructor(service: TestimonialsService);
    create(dto: CreateTestimonialDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
    findAll(query: FilterTestimonialsDto): Promise<{
        data: {
            id: any;
            ratings: any;
            reviews: any;
            doulaName: any;
            serviceName: any;
            clientName: any;
            createdAt: any;
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
        id: string;
        ratings: number;
        reviews: string;
        doulaName: string;
        serviceName: string;
        clientName: string;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateTestimonialDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        serviceId: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
    getTestimonials(req: any, page?: number, limit?: number): Promise<never[] | {
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            serviceId: string;
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
}
