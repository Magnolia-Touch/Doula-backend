// src/region/region.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/regions.dto';
import { paginate } from 'src/common/utility/pagination.util';
@Injectable()
export class RegionService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateRegionDto) {
        return this.prisma.region.create({
            data: dto,
        });
    }

    async findAll(page: number = 1, limit: number = 10, search?: string) {
        const where = search
            ? {
                OR: [
                    { regionName: { contains: search, mode: 'insensitive' } },
                    { district: { contains: search, mode: 'insensitive' } },
                    { state: { contains: search, mode: 'insensitive' } },
                    { country: { contains: search, mode: 'insensitive' } },
                ],
            }
            : undefined;

        const result = await paginate({
            prismaModel: this.prisma.region,
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' },
        });

        const data = result.data.map((region) => ({
            regionId: region.id,
            regionName: region.regionName,
            pincode: region.pincode,
            district: region.district,
            state: region.state,
            country: region.country,
            latitude: region.latitude,
            longitude: region.longitude,
            is_active: region.is_active,
            zoneManagerId: region.zoneManagerId,
        }));

        return {
            message: 'Regions fetched successfully',
            data,
            meta: result.meta,
        };
    }



    async findOne(id: string) {
        const region = await this.prisma.region.findUnique({
            where: { id },
            include: {
                zoneManager: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });

        if (!region) {
            throw new NotFoundException('Region not found');
        }

        return {
            regionId: region.id,
            regionName: region.regionName,
            pincode: region.pincode,
            district: region.district,
            state: region.state,
            country: region.country,
            latitude: region.latitude,
            longitude: region.longitude,

            zoneManagerId: region.zoneManager?.id ?? null,
            zonemanagerName: region.zoneManager?.user?.name ?? null,
            zonemanagerPhone: region.zoneManager?.user?.phone ?? null,
            zonemanagerEmail: region.zoneManager?.user?.email ?? null,
        };
    }


    async update(id: string, dto: UpdateRegionDto) {
        await this.findOne(id); // ensure exists
        return this.prisma.region.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.region.delete({
            where: { id },
        });
    }

    async asignRegionToZoneManager() { }

    async updateRegionOfZoneManager() { }

    async removeRegionFromZoneManager() { }
}
