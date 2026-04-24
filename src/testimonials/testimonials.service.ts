import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { CreateDirectTestimonialDto } from './dto/create-direct-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { paginate } from 'src/common/utility/pagination.util';
import {
  FilterTestimonialsDto,
  GetZmTestimonialDto,
} from './dto/filter-testimonials.dto';
import { paginateWithRelations } from 'src/common/utility/paginate-with-relations.util';
import { BookingStatus, Role } from '@prisma/client';

//testimonials can be added for purchased services.
@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateTestimonialDto, userId: string) {
    console.log('client Id', userId);
    console.log(dto);
    const client = await this.prisma.clientProfile.findUnique({
      where: { userId: userId },
      select: { id: true },
    });
    if (!client) {
      throw new NotFoundException('User Not Found');
    }

    const bookedservice = await this.prisma.serviceBooking.findFirst({
      where: {
        client: { userId: userId },
        id: dto.serviceBookingId,
        status: BookingStatus.COMPLETED,
      },
    });
    if (!bookedservice) {
      throw new NotFoundException(
        'No purchased service found for adding testimonial',
      );
    }
    return this.prisma.testimonials.create({
      data: {
        doulaProfileId: dto.doulaProfileId,
        serviceId: dto.servicePricingId,
        ratings: dto.ratings,
        reviews: dto.reviews,
        clientId: client.id,
      },
    });
  }

  async createDirect(dto: CreateDirectTestimonialDto) {
    const [doula, servicePricing] = await Promise.all([
      this.prisma.doulaProfile.findUnique({
        where: { id: dto.doulaProfileId },
        select: { id: true },
      }),
      this.prisma.servicePricing.findUnique({
        where: { id: dto.servicePricingId },
        select: { id: true },
      }),
    ]);

    if (!doula) {
      throw new NotFoundException('Doula profile not found');
    }

    if (!servicePricing) {
      throw new NotFoundException('Service pricing not found');
    }

    if (dto.clientPhone) {
      const phoneOwner = await this.prisma.user.findUnique({
        where: { phone: dto.clientPhone },
        select: { id: true, email: true },
      });

      if (phoneOwner && phoneOwner.email !== dto.clientEmail) {
        throw new ConflictException(
          'Phone number already belongs to another user',
        );
      }
    }

    let clientProfileId: string;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.clientEmail },
      include: { clientProfile: true },
    });

    if (existingUser) {
      if (existingUser.role !== Role.CLIENT) {
        throw new ConflictException('Email already exists with non-client role');
      }

      const user = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: dto.clientName,
          ...(dto.clientPhone ? { phone: dto.clientPhone } : {}),
        },
        include: { clientProfile: true },
      });

      if (user.clientProfile) {
        clientProfileId = user.clientProfile.id;
      } else {
        const profile = await this.prisma.clientProfile.create({
          data: { userId: user.id },
          select: { id: true },
        });
        clientProfileId = profile.id;
      }
    } else {
      const createdClient = await this.prisma.user.create({
        data: {
          name: dto.clientName,
          email: dto.clientEmail,
          ...(dto.clientPhone ? { phone: dto.clientPhone } : {}),
          role: Role.CLIENT,
          clientProfile: { create: {} },
        },
        include: { clientProfile: { select: { id: true } } },
      });

      if (!createdClient.clientProfile) {
        throw new NotFoundException('Failed to create client profile');
      }
      clientProfileId = createdClient.clientProfile.id;
    }

    return this.prisma.testimonials.create({
      data: {
        doulaProfileId: dto.doulaProfileId,
        serviceId: dto.servicePricingId,
        clientId: clientProfileId,
        ratings: dto.ratings,
        reviews: dto.reviews,
      },
    });
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
            user: { select: { name: true } },
          },
        },
        ServicePricing: {
          include: {
            service: { select: { name: true } },
          },
        },
        client: {
          include: {
            user: { select: { name: true } },
          },
        },
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
          include: { user: { select: { name: true } } },
        },
        ServicePricing: {
          include: { service: { select: { name: true } } },
        },
        client: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }

    // Ownership check (if needed for edit/delete)
    if (userId && testimonial.clientId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to modify this testimonial',
      );
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

  //fetch recent testimonial
  async getZoneManagerTestimonials(userId: string, page = 1, limit = 10) {
    // 1. find zone manager profile via userId
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId: userId },
      select: { id: true },
    });
    if (!zoneManager) return [];

    // 2. get doulas linked through M2M
    const doulas = await this.prisma.doulaProfile.findMany({
      where: {
        zoneManager: {
          some: {
            id: zoneManager.id,
          },
        },
      },
      select: { id: true },
    });

    const doulaIds = doulas.map((d) => d.id);
    if (doulaIds.length === 0) return [];

    return await paginate({
      prismaModel: this.prisma.testimonials,
      page,
      limit,
      where: {
        doulaProfileId: { in: doulaIds },
      },
      orderBy: { createdAt: 'desc' }, // latest first
      include: {
        DoulaProfile: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        ServicePricing: {
          include: {
            service: {
              select: { name: true },
            },
          },
        },
        client: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async getAllzmTestimonial(
    userId: string,
    dto: GetZmTestimonialDto,
    page = 1,
    limit = 10,
  ) {
    const { serviceName, ratings, startDate, endDate } = dto;

    /* ---------------- STEP 1: ZONE MANAGER ---------------- */

    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    /* ---------------- STEP 2: DOULAS UNDER ZM ---------------- */

    const doulas = await this.prisma.doulaProfile.findMany({
      where: {
        zoneManager: {
          some: { id: zoneManager.id },
        },
      },
      select: { id: true },
    });

    const doulaIds = doulas.map((d) => d.id);
    if (doulaIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    /* ---------------- STEP 3: WHERE CONDITION ---------------- */

    const where: any = {
      doulaProfileId: { in: doulaIds },
    };

    if (ratings) {
      where.ratings = Number(ratings);
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (serviceName) {
      where.ServicePricing = {
        service: {
          name: {
            contains: serviceName.toLowerCase(),
          },
        },
      };
    }

    /* ---------------- STEP 4: PAGINATION (RELATION-SAFE) ---------------- */

    const result = await paginateWithRelations({
      page,
      limit,

      query: () =>
        this.prisma.testimonials.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            client: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            DoulaProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            ServicePricing: {
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),

      countQuery: () =>
        this.prisma.testimonials.count({
          where,
        }),
    });

    /* ---------------- STEP 5: RESPONSE MAPPING ---------------- */

    return {
      data: result.data.map((t) => ({
        clientUserId: t.client.user.id,
        clientProfileId: t.client.id,
        clientName: t.client.user.name,

        doulaUserId: t.DoulaProfile.user.id,
        doulaProfileId: t.DoulaProfile.id,
        doulaName: t.DoulaProfile.user.name,

        ratings: t.ratings,
        reviews: t.reviews,
        testimonialCreatedAt: t.createdAt,

        serviceId: t.ServicePricing.service.id,
        servicePricingId: t.ServicePricing.id,
        serviceName: t.ServicePricing.service.name,
      })),
      meta: result.meta,
    };
  }

  async getZmTestimonialSummary(userId: string) {
    /* ---------------- STEP 1: FETCH ZONE MANAGER ---------------- */

    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      return {
        totalTestimonials: 0,
        averageRating: 0,
        fiveStarReviews: 0,
        thisMonth: 0,
      };
    }

    /* ---------------- STEP 2: FETCH DOULAS UNDER ZM ---------------- */

    const doulas = await this.prisma.doulaProfile.findMany({
      where: {
        zoneManager: {
          some: { id: zoneManager.id },
        },
      },
      select: { id: true },
    });

    const doulaIds = doulas.map((d) => d.id);
    if (!doulaIds.length) {
      return {
        totalTestimonials: 0,
        averageRating: 0,
        fiveStarReviews: 0,
        thisMonth: 0,
      };
    }

    /* ---------------- STEP 3: DATE RANGE (CURRENT MONTH) ---------------- */

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    /* ---------------- STEP 4: AGGREGATIONS ---------------- */

    const [totalCount, ratingAgg, fiveStarCount, thisMonthCount] =
      await Promise.all([
        this.prisma.testimonials.count({
          where: {
            doulaProfileId: { in: doulaIds },
          },
        }),

        this.prisma.testimonials.aggregate({
          where: {
            doulaProfileId: { in: doulaIds },
          },
          _avg: {
            ratings: true,
          },
        }),

        this.prisma.testimonials.count({
          where: {
            doulaProfileId: { in: doulaIds },
            ratings: 5,
          },
        }),

        this.prisma.testimonials.count({
          where: {
            doulaProfileId: { in: doulaIds },
            createdAt: {
              gte: startOfMonth,
              lt: endOfMonth,
            },
          },
        }),
      ]);

    /* ---------------- STEP 5: RESPONSE ---------------- */

    return {
      totalTestimonials: totalCount,
      averageRating: Number((ratingAgg._avg.ratings ?? 0).toFixed(1)),
      fiveStarReviews: fiveStarCount,
      thisMonth: thisMonthCount,
    };
  }
}
