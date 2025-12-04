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

        const result = await paginate({
            prismaModel: this.prisma.testimonials,
            page,
            limit,
            where,
            include: {
                DoulaProfile: {
                    include: {
                        user: { select: { name: true } }
                    }
                },
                ServicePricing: {
                    include: {
                        service: { select: { name: true } }
                    }
                },
                client: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Format response to contain only what you requested
        const formatted = result.data.map((item: any) => ({
            id: item.id,
            ratings: item.ratings,
            reviews: item.reviews,

            doulaName: item.DoulaProfile?.user?.name,
            serviceName: item.ServicePricing?.service?.name,
            clientName: item.client?.user?.name,

            createdAt: item.createdAt,
        }));

        return {
            data: formatted,
            meta: result.meta,
        };
    }

    async findOne(id: string, userId?: string) {
        const testimonial = await this.prisma.testimonials.findUnique({
            where: { id },
            include: {
                DoulaProfile: {
                    include: { user: { select: { name: true } } }
                },
                ServicePricing: {
                    include: { service: { select: { name: true } } }
                },
                client: {
                    include: { user: { select: { name: true } } }
                }
            }
        });

        if (!testimonial) {
            throw new NotFoundException('Testimonial not found');
        }

        // Ownership check (if needed for edit/delete)
        if (userId && testimonial.clientId !== userId) {
            throw new ForbiddenException('You are not allowed to modify this testimonial');
        }

        // Format output
        return {
            id: testimonial.id,
            ratings: testimonial.ratings,
            reviews: testimonial.reviews,

            doulaName: testimonial.DoulaProfile?.user?.name,
            serviceName: testimonial.ServicePricing?.service?.name,
            clientName: testimonial.client?.user?.name,

            createdAt: testimonial.createdAt,
        };
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

    async getZoneManagerTestimonials(zoneManagerId: string, page = 1, limit = 10) {

        // 1. find zone manager profile via userId
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId: zoneManagerId },
            select: { id: true }
        });
        if (!zoneManager) return [];

        // 2. get doulas linked through M2M
        const doulas = await this.prisma.doulaProfile.findMany({
            where: {
                zoneManager: {
                    some: {
                        id: zoneManager.id
                    }
                }
            },
            select: { id: true }
        });

        const doulaIds = doulas.map(d => d.id);
        if (doulaIds.length === 0) return [];

        return await paginate({
            prismaModel: this.prisma.testimonials,
            page,
            limit,
            where: {
                doulaProfileId: { in: doulaIds }
            },
            orderBy: { createdAt: 'desc' }, // latest first
            include: {
                DoulaProfile: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                ServicePricing: {
                    include: {
                        service: {
                            select: { name: true }
                        }
                    }
                },
                client: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            }
        });
    }
}