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
                    { regionName: { contains: search.toLowerCase() } },
                    { district: { contains: search.toLowerCase() } },
                    { state: { contains: search.toLowerCase() } },
                    { country: { contains: search.toLowerCase() } },
                ],
            }
            : undefined;
        return paginate({
            prismaModel: this.prisma.region,
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' }
        })
    }

    async findOne(id: string) {
        const region = await this.prisma.region.findUnique({
            where: { id },
            include: { zoneManager: true },
        });
        if (!region) throw new NotFoundException('Region not found');
        return region;
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
