import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicePricingDto, UpdateServicePricingDto } from './dto/service-pricing.dto';
import { paginate } from 'src/common/utility/pagination.util';


@Injectable()
export class ServicePricingService {
    constructor(private prisma: PrismaService) { }

    // Create a service Pricing
    async create(dto: CreateServicePricingDto, userId: string) {
        const user = await this.prisma.doulaProfile.findUnique({
            where: { userId: userId }
        })
        if (!user) {
            throw new NotFoundException("User Not found Exception")
        }
        return this.prisma.servicePricing.create({
            data: {
                serviceId: dto.serviceId,
                doulaProfileId: user.id,
                price: dto.price
            }
        });
    }

    async findAll(userId: string) {
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { userId: userId }
        });

        if (!doula) {
            throw new NotFoundException('Doula profile not found');
        }

        return this.prisma.servicePricing.findMany({
            where: { doulaProfileId: doula.id },
            orderBy: { createdAt: 'desc' },
            include: {
                DoulaProfile: true,
                service: true
            }
        });
    }

    // Get a single service Pricing
    async findOne(id: string) {
        const service = await this.prisma.servicePricing.findUnique({
            where: { id },
            include: {
                DoulaProfile: true,
                service: true
            }
        });

        if (!service) throw new NotFoundException('Service not found');
        return service;
    }

    // Update a service Pricing
    async update(id: string, dto: UpdateServicePricingDto) {
        await this.findOne(id); // ensures exists

        return this.prisma.servicePricing.update({
            where: { id: id },
            data: dto,
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
                    contains: name.toLowerCase()
                },
            };
        }
        if (doulaId) {
            where.doulaProfileId = doulaId;
        }
        return paginate({
            prismaModel: this.prisma.servicePricing,
            page: Number(page),
            limit: Number(limit),
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                DoulaProfile: true,
                service: true,
            },
        });
    }


    // Create a service Pricing
    async createPricing(dto: CreateServicePricingDto) {
        const user = await this.prisma.doulaProfile.findUnique({
            where: { id: dto.doulaId }
        })
        if (!user) {
            throw new NotFoundException("User Not found Exception")
        }
        return this.prisma.servicePricing.create({
            data: {
                serviceId: dto.serviceId,
                doulaProfileId: dto.doulaId,
                price: dto.price
            }
        });
    }


}
