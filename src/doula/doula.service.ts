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
    async create(dto: CreateDoulaDto, userId: string, profileImageUrl?: string) {
        // Check if user already exists with this email
        checkUserExistorNot(this.prisma, dto.email);

        // Find the logged-in user
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        console.log(dto.regionIds)
        // Validate region IDs
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });

        if (regions.length !== dto.regionIds.length) {
            throw new NotFoundException("One or more region IDs are invalid");
        }

        // -------------------------------------------------------------
        // CASE 1: CREATED BY ZONE MANAGER
        // -------------------------------------------------------------
        if (user?.role === Role.ZONE_MANAGER) {
            const manager = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId }
            });

            const doula = await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    phone: dto.phone,
                    role: Role.DOULA,
                    doulaProfile: {
                        create: {
                            Region: {
                                connect: dto.regionIds.map(id => ({ id })),
                            },
                            zoneManager: {
                                connect: { id: manager?.id }
                            },
                            profileImage: profileImageUrl ?? null,
                            description: dto.description,
                            qualification: dto.qualification,
                            achievements: dto.achievements,
                            yoe: dto.yoe,
                            languages: dto.languages,

                        }
                    }
                },
                include: {
                    doulaProfile: {
                        include: {
                            zoneManager: true,
                        }
                    }
                }
            });

            return {
                message: 'Doula created successfully',
                data: doula
            };
        }

        // -------------------------------------------------------------
        // CASE 2: CREATED BY ADMIN
        // -------------------------------------------------------------
        if (user?.role === Role.ADMIN) {

            // Get regions & their zone managers
            const regions = await this.prisma.region.findMany({
                where: { id: { in: dto.regionIds } },
                select: {
                    id: true,
                    zoneManager: { select: { id: true } }
                }
            });

            // Validate region count again for safety
            if (regions.length !== dto.regionIds.length) {
                throw new BadRequestException("One or more regions are invalid.");
            }

            // Extract zone manager IDs
            const zoneManagerIds = regions
                .filter(r => r.zoneManager)
                .map(r => r.zoneManager!.id);

            if (zoneManagerIds.length === 0) {
                throw new BadRequestException(
                    "Selected regions must have a Zone Manager assigned."
                );
            }
            console.log("languages", dto.languages)

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
                                connect: dto.regionIds.map(id => ({ id })),
                            },
                            zoneManager: {
                                connect: zoneManagerIds.map(id => ({ id }))
                            },
                            profileImage: profileImageUrl ?? null,
                            description: dto.description,
                            qualification: dto.qualification,
                            achievements: dto.achievements,
                            yoe: dto.yoe,
                            languages: dto.languages
                        }
                    }
                },
                include: {
                    doulaProfile: {
                        include: {
                            zoneManager: true,
                        }
                    }
                }
            });

            return {
                message: 'Doula created successfully',
                data: doula
            };
        }

        // Fallback
        throw new BadRequestException("Unauthorized role");
    }




    async get(
        page = 1,
        limit = 10,
        search?: string,
        serviceId?: string,
        isAvailable?: boolean,
        isActive?: boolean,
    ) {
        const where: any = {
            role: Role.DOULA,
        };

        // 🔍 Search filter  
        if (search) {
            const q = search.toLowerCase();
            where.OR = [
                // Search by Doula name, email, phone (User Model)
                { name: { contains: q } },
                { email: { contains: q } },
                { phone: { contains: q } },

                // Search by Region name (DoulaProfile -> Region)
                {
                    doulaProfile: {
                        Region: {
                            some: {
                                regionName: { contains: q },
                            },
                        },
                    },
                },

                // Search by Zone Manager Email
                {
                    doulaProfile: {
                        zoneManager: {
                            some: {
                                user: {
                                    email: { contains: q },
                                },
                            },
                        },
                    },
                },
            ];
        }

        // 🟢 Filter by is_active
        if (typeof isActive === 'boolean') {
            where.is_active = isActive;
        }

        // 🟦 Filter by Service (ServicePricing) 
        if (serviceId) {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                ServicePricing: {
                    some: {
                        serviceId: serviceId,
                    },
                },
            };
        }

        // 🟩 Filter by Availability
        if (typeof isAvailable === 'boolean') {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                AvailableSlotsForService: isAvailable
                    ? {
                        some: {
                            isBooked: false, // or availability flag based on your schema
                        },
                    }
                    : {},
            };
        }

        // Final Query with Pagination
        const result = await paginate({
            prismaModel: this.prisma.user,
            page,
            limit,
            where,
            include: {
                doulaProfile: {
                    include: {
                        Region: true,
                        zoneManager: {
                            include: {
                                user: true,
                            },
                        },
                        ServicePricing: true,
                        AvailableSlotsForService: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            message: 'Doulas fetched successfully',
            ...result,
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
