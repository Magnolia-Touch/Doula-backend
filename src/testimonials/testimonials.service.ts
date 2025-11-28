import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { paginate } from 'src/common/utility/pagination.util';
import { FilterTestimonialsDto } from './dto/filter-testimonials.dto';

//testimonials can be added for purchased services.
@Injectable()
export class TestimonialsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateTestimonialDto, user: any) {
        const bookedservice = await this.prisma.serviceBooking.findFirst({
            where: { client: { userId: user.id }, servicePricingId: dto.serviceId }
        });
        if (!bookedservice) {
            throw new NotFoundException("No purchased service found for adding testimonial")
        }
        return this.prisma.testimonials.create({ data: { ...dto, clientId: user.id } });
    }

    async findAll(query: FilterTestimonialsDto) {
        const { doulaId, serviceId } = query;

        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 10;

        const where: any = {};

        if (doulaId) where.doulaProfileId = doulaId;
        if (serviceId) where.servicePricingId = serviceId;

        return paginate({
            prismaModel: this.prisma.testimonials,
            page,
            limit,
            where,
            include: {
                DoulaProfile: true,
                ServicePricing: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }


    async findOne(id: string, userId?: string) {
        const testimonial = await this.prisma.testimonials.findUnique({
            where: { id },
        });

        if (!testimonial) {
            throw new NotFoundException('Testimonial not found');
        }

        // If checking ownership (for update/delete)
        if (userId && testimonial.clientId !== userId) {
            throw new ForbiddenException('You are not allowed to modify this testimonial');
        }

        return testimonial;
    }

    async update(id: string, dto: UpdateTestimonialDto, userId: string) {
        // Validate + ownership check
        await this.findOne(id, userId);

        return this.prisma.testimonials.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, userId: string) {
        // Validate + ownership check
        await this.findOne(id, userId);

        return this.prisma.testimonials.delete({
            where: { id },
        });
    }
}