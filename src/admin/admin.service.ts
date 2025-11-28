import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
// import { UpdateZoneManagerDto } from './dto/update-zone-manager.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // Create new Zone Manager
    async create(dto: CreateAdminDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }
        const admin = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: Role.ADMIN,
                adminProfile: {
                    create: {},
                },
            },
            include: { zonemanagerprofile: true },
        });

        return { message: 'Admin created successfully', data: admin };
    }

    // Get all Admins
    async get() {
        const admin = await this.prisma.user.findMany({
            where: { role: Role.ADMIN },
            include: { adminProfile: true }
        })
        return { message: "Admins Fetched Successfully", data: admin }
    }

    // Get Admin by ID
    async getById(id: string) {
        const admin = await this.prisma.user.findUnique({
            where: { id },
            include: { adminProfile: true },
        });

        if (!admin || admin.role !== Role.ADMIN) {
            throw new NotFoundException('Admin not found');
        }

        return { message: 'Admin fetched successfully', data: admin };
    }

    // Look on Zone Manager Updations needed side
    // // ✅ Update Zone Manager details
    // async update(id: string, dto: UpdateZoneManagerDto) {
    //     const existing = await this.prisma.user.findUnique({ where: { id } });
    //     if (!existing || existing.role !== Role.ZONE_MANAGER) {
    //         throw new NotFoundException('Zone Manager not found');
    //     }

    //     const updated = await this.prisma.user.update({
    //         where: { id },
    //         data: {
    //             name: dto.name ?? existing.name,
    //             email: dto.email ?? existing.email,
    //             phone: dto.phone ?? existing.phone,
    //             zonemanagerprofile: dto.zoneName || dto.region ? {
    //                 update: {
    //                     zoneName: dto.zoneName ?? existing.zonemanagerprofile?.zoneName,
    //                     region: dto.region ?? existing.zonemanagerprofile?.region,
    //                 },
    //             } : undefined,
    //         },
    //         include: { zonemanagerprofile: true },
    //     });

    //     return { message: 'Zone Manager updated successfully', data: updated };
    // }

    // Delete Zone Manager
    async delete(id: string) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== Role.ADMIN) {
            throw new NotFoundException('Admin not found');
        }

        await this.prisma.user.delete({ where: { id } });

        return { message: 'Admin deleted successfully', data: null };
    }
}
