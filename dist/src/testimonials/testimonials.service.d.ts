import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { FilterTestimonialsDto } from './dto/filter-testimonials.dto';
export declare class TestimonialsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTestimonialDto, user: any): Promise<{
        id: string;
        serviceId: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
    findAll(query: FilterTestimonialsDto): Promise<{
        data: {
            id: string;
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
    findOne(id: string, userId?: string): Promise<{
        id: string;
        serviceId: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
    update(id: string, dto: UpdateTestimonialDto, userId: string): Promise<{
        id: string;
        serviceId: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        serviceId: string;
        doulaProfileId: string;
        clientId: string;
        ratings: number;
        reviews: string;
    }>;
}
