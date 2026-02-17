// src/region/region.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/regions.dto';
import { paginate } from 'src/common/utility/pagination.util';
@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRegionDto) {
    return this.prisma.region.create({
      data: dto,
    });
  }

  private mapRegion(region: any) {
    return {
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
    };
  }
  async findAll(
    page?: number,
    limit?: number,
    search?: string,
    is_active?: boolean,
  ) {
    const where: any = {};

    // 🔍 Search filter
    if (search) {
      where.OR = [
        { regionName: { contains: search } },
        { district: { contains: search } },
        { state: { contains: search } },
        { country: { contains: search } },
      ];
    }

    // ✅ Active / Inactive filter
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    // ✅ NO pagination → fetch all
    if (!page || !limit) {
      const regions = await this.prisma.region.findMany({
        where: Object.keys(where).length ? where : undefined,
        include: { zoneManager: true },
        orderBy: { createdAt: 'desc' },
      });

      return {
        message: 'Regions fetched successfully',
        data: regions.map(this.mapRegion),
        meta: {
          total: regions.length,
          page: null,
          limit: null,
        },
      };
    }

    // ✅ Pagination applied
    const result = await paginate({
      prismaModel: this.prisma.region,
      page,
      limit,
      where,
      include: { zoneManager: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Regions fetched successfully',
      data: result.data.map(this.mapRegion),
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
      is_active: region.is_active,

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
    return this.prisma.region.update({
      where: { id },
      data: { is_active: false },
    });
  }
}
