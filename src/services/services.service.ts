import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // Create a service
  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: dto,
    });
  }

  // List all services
  async findAll() {
    return this.prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get a single service
  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  // Update a service
  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id); // ensures exists

    return this.prisma.service.update({
      where: { id },
      data: dto,
    });
  }

  // Delete a service
  async remove(id: string) {
    await this.findOne(id); // ensures exists

    return this.prisma.service.delete({
      where: { id },
    });
  }
}
