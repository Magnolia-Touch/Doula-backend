import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
// import { UpdateZoneManagerDto } from './dto/update-zone-manager.dto';
import { Prisma, Role } from '@prisma/client';
import { paginate } from 'src/common/utility/pagination.util';
import { findRegionOrThrow, findZoneManagerOrThrowWithId } from 'src/common/utility/service-utils';
import { UpdateZoneManagerRegionDto } from './dto/update-zone-manager.dto';

@Injectable()
export class ZoneManagerService {
    constructor(private prisma: PrismaService) { }

    // Create new Zone Manager
    async create(dto: CreateZoneManagerDto, profileImageUrl?: string) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        console.log("regionIds", dto.regionIds)
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
                        },
                        profile_image: profileImageUrl ?? null,
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
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    {
                        zonemanagerprofile: {
                            managingRegion: {
                                some: {
                                    regionName: {
                                        contains: search,
                                        mode: 'insensitive',
                                    },
                                },
                            },
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
            orderBy: { createdAt: 'desc' },
            include: {
                zonemanagerprofile: {
                    include: {
                        managingRegion: {
                            select: { regionName: true },
                        },
                        doulas: {
                            include: {
                                user: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        /**
         * 👇 Explicit Prisma payload typing (KEY FIX)
         */
        type ZoneManagerUserWithRelations =
            Prisma.UserGetPayload<{
                include: {
                    zonemanagerprofile: {
                        include: {
                            managingRegion: {
                                select: { regionName: true };
                            };
                            doulas: {
                                include: {
                                    user: {
                                        select: { name: true };
                                    };
                                };
                            };
                        };
                    };
                };
            }>;

        const data = (result.data as ZoneManagerUserWithRelations[]).map((user) => ({
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            is_active: user.is_active,

            profileId: user.zonemanagerprofile?.id ?? null,

            regions:
                user.zonemanagerprofile?.managingRegion.map(
                    (r) => r.regionName,
                ) ?? [],

            doulas:
                user.zonemanagerprofile?.doulas
                    .map((d) => d.user?.name)
                    .filter(Boolean) ?? [],
        }));

        return {
            message: 'Zone Managers fetched successfully',
            data,
            meta: result.meta,
        };
    }


    async getById(id: string) {
        const zoneManager = await this.prisma.user.findUnique({
            where: { id },
            include: {
                zonemanagerprofile: {
                    include: {
                        managingRegion: true, // ✅ full Region objects
                        doulas: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        phone: true,
                                        is_active: true,
                                    },
                                },
                                Region: true, // regions assigned to doula
                            },
                        },
                    },
                },
            },
        });

        if (!zoneManager || zoneManager.role !== Role.ZONE_MANAGER) {
            throw new NotFoundException('Zone Manager not found');
        }

        const profile = zoneManager.zonemanagerprofile;

        const response = {
            userId: zoneManager.id,
            name: zoneManager.name,
            email: zoneManager.email,
            phone: zoneManager.phone,
            role: zoneManager.role,
            is_active: zoneManager.is_active,

            profileId: profile?.id ?? null,

            regions: profile?.managingRegion.map((region) => ({
                id: region.id,
                regionName: region.regionName,
                pincode: region.pincode,
                district: region.district,
                state: region.state,
                country: region.country,
                latitude: region.latitude,
                longitude: region.longitude,
                is_active: region.is_active,
            })) ?? [],

            doulas: profile?.doulas.map((doula) => ({
                doulaProfileId: doula.id,
                userId: doula.user.id,
                name: doula.user.name,
                email: doula.user.email,
                phone: doula.user.phone,
                is_active: doula.user.is_active,

                description: doula.description,
                qualification: doula.qualification,
                achievements: doula.achievements,
                yoe: doula.yoe,
                languages: doula.languages,

                regions: doula.Region.map((region) => ({
                    id: region.id,
                    regionName: region.regionName,
                    pincode: region.pincode,
                    district: region.district,
                    state: region.state,
                    country: region.country,
                })),
            })) ?? [],
        };

        return {
            message: 'Zone Manager fetched successfully',
            data: response,
        };
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
