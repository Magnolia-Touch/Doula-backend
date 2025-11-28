import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
// import { UpdateclientsDto } from './dto/update-zone-manager.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    // Create new Clients
    async create(dto: CreateClientDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }
        const clients = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: Role.CLIENT,
                clientProfile: {
                    create: {},
                },
            },
            include: { clientProfile: true },
        });

        return { message: 'Clients created successfully', data: clients };
    }

    // Get all Clients
    async get() {
        const clientss = await this.prisma.user.findMany({
            where: { role: Role.CLIENT },
            include: { clientProfile: true }
        })
        return { message: "Clients Fetched Successfully", data: clientss }
    }

    // Get Clients by ID
    async getById(id: string) {
        const clients = await this.prisma.user.findUnique({
            where: { id },
            include: { clientProfile: true },
        });

        if (!clients || clients.role !== Role.CLIENT) {
            throw new NotFoundException('Clients not found');
        }

        return { message: 'Clients fetched successfully', data: clients };
    }

    // Look on Client needed side
    // // ✅ Update Zone Manager details
    // async update(id: string, dto: UpdateclientsDto) {
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
    //             clientsprofile: dto.zoneName || dto.region ? {
    //                 update: {
    //                     zoneName: dto.zoneName ?? existing.clientsprofile?.zoneName,
    //                     region: dto.region ?? existing.clientsprofile?.region,
    //                 },
    //             } : undefined,
    //         },
    //         include: { clientsprofile: true },
    //     });

    //     return { message: 'Zone Manager updated successfully', data: updated };
    // }

    // Delete Zone Manager
    async delete(id: string) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== Role.CLIENT) {
            throw new NotFoundException('Client not found');
        }

        await this.prisma.user.delete({ where: { id } });

        return { message: 'Client deleted successfully', data: null };
    }
}
