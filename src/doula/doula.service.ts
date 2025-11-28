import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
// import { UpdateZoneManagerDto } from './dto/update-zone-manager.dto';
import { Role } from '@prisma/client';
import { paginate } from 'src/common/utility/pagination.util';
import { checkUserExistorNot } from 'src/common/utility/service-utils';
import { UpdateDoulaRegionDto } from './dto/update-doula.dto';

@Injectable()
export class DoulaService {
    constructor(private prisma: PrismaService) { }

    // Create new Doula
    //if admin is creating doula, zone manager of regions are added to doulas profile.
    async create(dto: CreateDoulaDto, userId: string) {
        checkUserExistorNot(this.prisma, dto.email)
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        })
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        })
        if (regions.length != dto.regionIds.length) {
            throw new NotFoundException("One or more region IDs are invalid");
        }

        if (user?.role == Role.ZONE_MANAGER) {
            const manager = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: userId }
            })
            const doula = await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    phone: dto.phone,
                    role: Role.DOULA,
                    doulaProfile: {
                        create: {
                            Region: {
                                connect: dto.regionIds.map((id) => ({ id })),
                            },
                            zoneManager: {
                                connect: { id: manager?.id }
                            }

                        },
                    },
                },
                include: {
                    doulaProfile: {
                        include: { zoneManager: true },
                    },
                },
            });

            return { message: 'Doulas created successfully', data: doula };
        }
        else if (user?.role == Role.ADMIN) {

            // Fetch regions with their zone managers
            const regions = await this.prisma.region.findMany({
                where: { id: { in: dto.regionIds } },
                select: {
                    id: true,
                    zoneManager: { select: { id: true } }
                }
            });

            // Validate that regions exist
            if (regions.length !== dto.regionIds.length) {
                throw new BadRequestException("One or more regions are invalid.");
            }

            // Extract zoneManager IDs
            const zoneManagerIds = regions
                .filter(r => r.zoneManager)
                .map(r => r.zoneManager?.id);

            // Validate that all selected regions have a zone manager
            if (zoneManagerIds.length === 0) {
                throw new BadRequestException(
                    "Selected regions must have a Zone Manager assigned."
                );
            }

            // Create doula
            const doula = await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    phone: dto.phone,
                    role: Role.DOULA,
                    doulaProfile: {
                        create: {
                            Region: {
                                connect: dto.regionIds.map((id) => ({ id })),
                            },
                            zoneManager: {
                                connect: zoneManagerIds.map(id => ({ id }))
                            },
                        },
                    },
                },
                include: {
                    doulaProfile: {
                        include: { zoneManager: true },
                    },
                },
            });

            return { message: 'Doulas created successfully', data: doula };
        }

    }


    // Doula can be searched using their name, email, phone. Region Name and Zone manager Email
    async get(page = 1, limit = 10, search?: string) {
        const where = {
            role: Role.DOULA,
            OR: search
                ? [
                    // Search by Doula name, email, phone
                    { name: { contains: search.toLowerCase() } },
                    { email: { contains: search.toLowerCase() } },
                    { phone: { contains: search.toLowerCase() } },

                    // Search by Region name
                    {
                        doulaProfile: {
                            Region: {
                                some: {
                                    regionName: {
                                        contains: search.toLowerCase()
                                    }
                                }
                            }
                        },
                    },

                    // Search by Zone Manager email
                    {
                        doulaProfile: {
                            zoneManager: {
                                some: {
                                    user: {
                                        email: { contains: search.toLowerCase() },
                                    },
                                }

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
            include: {
                doulaProfile: {
                    include: {
                        Region: true,
                        zoneManager: true
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            message: 'Doulas fetched successfully',
            ...result, // includes { data, meta }
        };
    }


    // Get Doula by ID
    async getById(id: string) {
        const doula = await this.prisma.user.findUnique({
            where: { id },
            include: { doulaProfile: true },
        });

        if (!doula || doula.role !== Role.DOULA) {
            throw new NotFoundException('Doula not found');
        }

        return { message: 'Doula fetched successfully', data: doula };
    }

    async delete(id: string) {
        // 1. find user
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
            include: { doulaProfile: true }
        });

        if (!existingUser || existingUser.role !== Role.DOULA) {
            throw new NotFoundException('Doula not found');
        }

        // 2. delete DoulaProfile first
        if (existingUser.doulaProfile) {
            await this.prisma.doulaProfile.delete({
                where: { userId: existingUser.id },
            });
        }

        // 3. delete User
        await this.prisma.user.delete({
            where: { id },
        });

        return { message: 'Doula deleted successfully', data: null };
    }



    async updateStatus(id: string, isActive: boolean) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== Role.DOULA) {
            throw new NotFoundException('Doula not found');
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                is_active: isActive,
            },
        });

        return { message: 'Doula status updated successfully', data: updated };
    }


    async UpdateDoulaRegions(dto: UpdateDoulaRegionDto, userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        // Validate doula
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { id: dto.profileId },
            include: { zoneManager: true, Region: true },
        });
        if (!doula) throw new NotFoundException("Doula does not exist");

        // Fetch regions with their managers
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
            select: { id: true, zoneManager: { select: { id: true } } }
        });
        if (regions.length !== dto.regionIds.length)
            throw new NotFoundException("One or more region IDs are invalid");

        // ---------------------- ZONE MANAGER FLOW ----------------------
        if (user?.role === Role.ZONE_MANAGER) {
            const zn = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId }
            });
            if (!zn) throw new NotFoundException("Zone Manager profile not found");

            // Check that every region belongs to this zone manager
            const unauthorized = regions.some(r => r.zoneManager?.id !== zn.id);
            if (unauthorized) {
                throw new BadRequestException(
                    "You cannot assign regions that are not managed by you."
                );
            }

            // Apply add/remove
            const update = await this.prisma.doulaProfile.update({
                where: { id: dto.profileId },
                data: {
                    Region: {
                        [dto.purpose === "add" ? "connect" : "disconnect"]:
                            dto.regionIds.map(id => ({ id })),
                    },
                    ...(dto.purpose === "add"
                        ? { zoneManager: { connect: { id: zn.id } } }
                        : {} // removing does not detach zone manager
                    ),
                },
                include: { Region: true, zoneManager: true },
            });

            return {
                message: `Regions ${dto.purpose === "add" ? "added" : "removed"} successfully`,
                data: update,
            };
        }

        // --------------------------- ADMIN FLOW ---------------------------
        if (user?.role === Role.ADMIN) {
            if (dto.purpose === "add") {
                const zoneManagerIds = regions
                    .map(r => r.zoneManager?.id)
                    .filter(id => id);

                if (zoneManagerIds.length !== regions.length)
                    throw new BadRequestException("All selected regions must have a Zone Manager assigned");

                const update = await this.prisma.doulaProfile.update({
                    where: { id: dto.profileId },
                    data: {
                        Region: {
                            connect: dto.regionIds.map(id => ({ id }))
                        },
                        zoneManager: {
                            connect: zoneManagerIds.map(id => ({ id }))
                        }
                    },
                    include: { Region: true, zoneManager: true },
                });

                return { message: "Regions added successfully", data: update };
            }

            if (dto.purpose === "remove") {
                const update = await this.prisma.doulaProfile.update({
                    where: { id: dto.profileId },
                    data: {
                        Region: {
                            disconnect: dto.regionIds.map(id => ({ id }))
                        }
                    },
                    include: { Region: true, zoneManager: true },
                });

                return { message: "Regions removed successfully", data: update };
            }
        }

        throw new BadRequestException("Invalid purpose");
    }

}
