import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
// import { UpdateZoneManagerDto } from './dto/update-zone-manager.dto';
import { Role } from '@prisma/client';
import { paginate } from 'src/common/utility/pagination.util';
import { findRegionOrThrow, findZoneManagerOrThrowWithId } from 'src/common/utility/service-utils';
import { UpdateZoneManagerRegionDto } from './dto/update-zone-manager.dto';

@Injectable()
export class ZoneManagerService {
    constructor(private prisma: PrismaService) { }

    // Create new Zone Manager
    async create(dto: CreateZoneManagerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        })
        if (regions.length != dto.regionIds.length) {
            throw new NotFoundException("One or more region IDs are invalid");
        }

        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }
        const zoneManager = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: Role.ZONE_MANAGER,
                zonemanagerprofile: {
                    create: {
                        managingRegion: {
                            connect: dto.regionIds.map((id) => ({ id }))
                        }
                    },
                },
            },
            include: { zonemanagerprofile: true },
        });

        return { message: 'Zone Manager created successfully', data: zoneManager };
    }


    async get(page = 1, limit = 10, search?: string) {
        const where = {
            role: Role.ZONE_MANAGER,
            OR: search
                ? [
                    { name: { contains: search.toLowerCase() } },
                    { email: { contains: search.toLowerCase() } },
                    { phone: { contains: search.toLowerCase() } },
                    {
                        zonemanagerprofile: {
                            managingRegion: {
                                some: {
                                    regionName: {
                                        contains: search.toLowerCase()
                                    }
                                }
                            }
                        },
                    },
                ]
                : undefined,
        };

        const result = await paginate({
            prismaModel: this.prisma.user,
            page,
            limit,
            where,
            include: {
                zonemanagerprofile: {
                    include: { managingRegion: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            message: 'Zone Managers fetched successfully',
            ...result, // includes { data, meta }
        };
    }


    // Get Zone Manager by ID
    async getById(id: string) {
        const zoneManager = await this.prisma.user.findUnique({
            where: { id },
            include: { zonemanagerprofile: true },
        });

        if (!zoneManager || zoneManager.role !== Role.ZONE_MANAGER) {
            throw new NotFoundException('Zone Manager not found');
        }

        return { message: 'Zone Manager fetched successfully', data: zoneManager };
    }

    // Delete Zone Manager
    async delete(id: string) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== Role.ZONE_MANAGER) {
            throw new NotFoundException('Zone Manager not found');
        }

        await this.prisma.user.delete({ where: { id } });

        return { message: 'Zone Manager deleted successfully', data: null };
    }

    async updateStatus(id: string, isActive: boolean) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== Role.ZONE_MANAGER) {
            throw new NotFoundException('Zone Manager not found');
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                is_active: isActive,
            },
        });

        return { message: 'Zone Manager status updated successfully', data: updated };
    }


    async UpdateZoneManagerRegions(dto: UpdateZoneManagerRegionDto) {
        const a = findZoneManagerOrThrowWithId(this.prisma, dto.profileId)
        console.log(a)
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        })
        if (regions.length != dto.regionIds.length) {
            throw new NotFoundException("One or more region IDs are invalid");
        }

        if (dto.purpose == "add") {
            const data = await this.prisma.region.updateMany({
                where: { id: { in: dto.regionIds } },
                data: { zoneManagerId: dto.profileId }
            })

            return { message: `${data.count} Region(s) successfully assigned to Manager` };
        }
        else if (dto.purpose == "remove") {
            const data = await this.prisma.region.updateMany({
                where: { id: { in: dto.regionIds } },
                data: { zoneManagerId: null }
            })

            return { message: `${data.count} Region(s) successfully removed from Manager` };
        }
    }

    //helper api
    async regionAlreadyAssignedOrNot(regionIds: string[]) {
        const regions = await this.prisma.region.findMany({
            where: { id: { in: regionIds } },
            select: { id: true, regionName: true, zoneManagerId: true }
        });

        if (regions.length !== regionIds.length) {
            throw new NotFoundException("One or more region IDs are invalid");
        }

        const assigned = regions.filter(r => r.zoneManagerId !== null);
        const unassigned = regions.filter(r => r.zoneManagerId === null);

        return {
            message: "Region assignment status fetched",
            assignedCount: assigned.length,
            unassignedCount: unassigned.length,
            assigned,
            unassigned
        };
    }


}
