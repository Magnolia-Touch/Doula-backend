import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsService } from 'src/client/client.service';
import { DoulaService } from 'src/doula/doula.service';
import { ZoneManagerService } from 'src/zone_manager/zone_manager.service';
import { AdminService } from 'src/admin/admin.service';
import { Role } from '@prisma/client';
import { generate6DigitOtp } from 'src/common/utility/utils';
import { MailService } from 'src/mail/mail.service';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clients: ClientsService,
    private readonly admin: AdminService,
    private readonly zonemanager: ZoneManagerService,
    private readonly doula: DoulaService,
    private readonly jwtService: JwtService,

    private readonly mail: MailService,
  ) { }

  //make this to just a create admin funtion without otp
  async RegisterUser(dto: UserRegistrationDto) {
    const otp = generate6DigitOtp();
    const { name, email, phone } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) {
      throw new ConflictException('User with this email already exists');
    }

    const created = await this.prisma.user.create({
      data: {
        name: name,
        email: email,
        phone: phone,
        role: Role.CLIENT,
        otp: otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        clientProfile: { create: { is_verified: false } },
      },
    });
    try {
      await this.mail.sendMail({
        to: email,
        subject: 'Your OTP Code – Bambini Doula',
        template: 'otp',
        context: {
          appName: 'Bambini Doula',
          otp,
          expiryMinutes: 10,
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {

      await this.prisma.user.update({
        where: { email },
        data: {
          otp: null,
          otpExpiresAt: null,
        },
      });

      throw error; // <-- IMPORTANT: rethrow original error
    }
    return { message: 'Otp Sent Succesfully', data: otp };
  }

  async deleteAll() {
    return this.prisma.schedules.deleteMany({});
  }

  async changeUserStatus(
    dto: ChangeUserStatusDto,
    currentUserRole: Role
  ) {
    if (currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admin can change user status');
    }

    const { userId, is_active } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, is_active: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Optional safety rule
    if (user.role === Role.ADMIN && is_active === false) {
      throw new ForbiddenException('Admin user cannot be deactivated');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { is_active },
      select: {
        id: true,
        role: true,
        is_active: true,
        updatedAt: true,
      },
    });

    return {
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    };
  }

}
