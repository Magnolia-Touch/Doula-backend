import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';

@Injectable()
export class DeviceTokenService {
  constructor(private prisma: PrismaService) {}

  async register(dto: CreateDeviceTokenDto) {
    const exists = await this.prisma.deviceToken.findFirst({
      where: { token: dto.token },
    });

    if (!exists) {
      return this.prisma.deviceToken.create({
        data: {
          userId: dto.userId,
          token: dto.token,
        },
      });
    }
    return exists; // token already stored
  }

  async findByUser(userId: string) {
    return this.prisma.deviceToken.findMany({
      where: { userId },
    });
  }

  async delete(token: string) {
    return this.prisma.deviceToken.deleteMany({
      where: { token },
    });
  }
}
