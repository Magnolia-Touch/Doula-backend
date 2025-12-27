import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateServicePricingDto,
  UpdateServicePricingDto,
  PriceBreakdownDto
} from './dto/service-pricing.dto';
import { paginate } from 'src/common/utility/pagination.util';

@Injectable()
export class ServicePricingService {
  constructor(private prisma: PrismaService) { }

  private toJsonPrice(price: PriceBreakdownDto) {
    return {
      morning: price.morning,
      night: price.night,
      fullday: price.fullday,
    };
  }


  async create(dto: CreateServicePricingDto, userId: string) {
    const user = await this.prisma.doulaProfile.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.servicePricing.create({
      data: {
        serviceId: dto.serviceId,
        doulaProfileId: user.id,
        price: this.toJsonPrice(dto.price), // ✅ FIX
      },
    });

  }

  async findAll(userId: string) {
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId },
    });

    if (!doula) {
      throw new NotFoundException('Doula profile not found');
    }

    const pricingList = await this.prisma.servicePricing.findMany({
      where: { doulaProfileId: doula.id },
      orderBy: { createdAt: 'desc' },
      include: {
        DoulaProfile: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        service: true,
      },
    });

    const data = pricingList.map((pricing) => ({
      servicePricingId: pricing.id,
      price: pricing.price, // { morning, night, fullday }

      doulaProfileId: pricing.doulaProfileId,
      doulaName: pricing.DoulaProfile.user.name,
      doulaEmail: pricing.DoulaProfile.user.email,
      doulaPhone: pricing.DoulaProfile.user.phone,

      serviceId: pricing.service.id,
      serviceName: pricing.service.name,
      serviceDescription: pricing.service.description,
    }));


    return {
      message: 'Service pricing fetched successfully',
      data,
    };
  }


  async findOne(id: string) {
    const pricing = await this.prisma.servicePricing.findUnique({
      where: { id },
      include: {
        DoulaProfile: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        service: true,
      },
    });

    if (!pricing) {
      throw new NotFoundException('Service pricing not found');
    }

    return {
      servicePricingId: pricing.id,
      price: pricing.price,

      doulaProfileId: pricing.doulaProfileId,
      doulaName: pricing.DoulaProfile.user.name,
      doulaEmail: pricing.DoulaProfile.user.email,
      doulaPhone: pricing.DoulaProfile.user.phone,

      serviceId: pricing.service.id,
      serviceName: pricing.service.name,
      serviceDescription: pricing.service.description,
    };

  }

  async update(id: string, dto: UpdateServicePricingDto) {
    await this.findOne(id);

    return this.prisma.servicePricing.update({
      where: { id },
      data: {
        price: dto.price ? this.toJsonPrice(dto.price) : undefined, // ✅ FIX
      },
    });
  }

  // Delete a service Pricing
  async remove(id: string) {
    await this.findOne(id); // ensures exists

    return this.prisma.servicePricing.delete({
      where: { id },
    });
  }
  async listServices(query: any) {
    const { name, doulaId, page = 1, limit = 10 } = query;

    const where: any = {};

    if (name) {
      where.service = {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      };
    }

    if (doulaId) {
      where.doulaProfileId = doulaId;
    }

    const result = await paginate({
      prismaModel: this.prisma.servicePricing,
      page: Number(page),
      limit: Number(limit),
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        DoulaProfile: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      ...result,
      data: result.data.map((item: any) => ({
        email: item.DoulaProfile.user.email,
        userId: item.DoulaProfile.user.id,
        profileId: item.DoulaProfile.id,
        servicePricingId: item.id,
        serviceId: item.service.id,
        serviceName: item.service.name,
        price: item.price,

      })),
    };
  }

}
