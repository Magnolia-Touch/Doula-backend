import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsService } from 'src/client/client.service';
import { DoulaService } from 'src/doula/doula.service';
import { ZoneManagerService } from 'src/zone_manager/zone_manager.service';
import { AdminService } from 'src/admin/admin.service';
import { Role } from '@prisma/client';
import { generate6DigitOtp } from 'src/common/utility/utils';
import { MailerService } from '@nestjs-modules/mailer';
import { RegistrationDto } from './dto/registration.dto';
import { LoginDto } from './dto/login.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clients: ClientsService,
    private readonly admin: AdminService,
    private readonly zonemanager: ZoneManagerService,
    private readonly doula: DoulaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) { }

  //make this to just a create admin funtion without otp
  async RegisterAdmin(dto: RegistrationDto) {
    const { name, email, phone } = dto;
    console.log(dto.email);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) {
      throw new NotFoundException('User with this email already exists');
    }
    console.log(user);
    const created = await this.prisma.user.create({
      data: {
        name: name,
        email: email,
        phone: phone,
        role: Role.ADMIN,
      },
    });
    return { message: 'Otp Sent Succesfully', data: created };
  }

  async LoginOtp(dto: LoginDto) {
    const { email } = dto;
    const otp = generate6DigitOtp();
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    //if no user throw error.
    if (!user) {
      throw new NotFoundException('No User Found');
    }
    if (
      user.role == Role.DOULA ||
      user.role == Role.ADMIN ||
      user.role == Role.ZONE_MANAGER ||
      user.role == Role.CLIENT
    ) {
      await this.prisma.user.update({
        where: { email: email },
        data: {
          otp: otp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      return { message: 'Otp Sent Succesfully', data: otp };
    } else {
      throw new Error('Invalid Role.');
    }
  }

  async verifyOtp(dto: OtpVerifyDto) {
    const { email, otp } = dto;
    // 1️⃣ Find the user by email
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // 2️⃣ Check if OTP and expiry exist
    if (!user.otp || !user.otpExpiresAt) {
      throw new UnauthorizedException('No OTP found for this user');
    }

    // 3️⃣ Validate OTP and expiry
    const isOtpValid = user.otp === otp;
    const isOtpNotExpired = user.otpExpiresAt > new Date();

    if (!isOtpValid || !isOtpNotExpired) {
      throw new UnauthorizedException('Invalid OTP or OTP has expired');
    }

    // 5️⃣ Clear OTP fields (optional but recommended for security)
    await this.prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiresAt: null },
    });

    // 6️⃣ Return response with JWT token
    return {
      user: user,
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
      }),
      message: 'User Verified Successfully',
      status: 200,
    };
  }

  async Profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminProfile: {
          include: {
            notes: true,
          },
        },
        doulaProfile: {
          include: {
            Region: true,
            DoulaGallery: true,
          },
        },
        clientProfile: true,
        zonemanagerprofile: {
          include: {
            managingRegion: true,
            doulas: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    is_active: true,
                    role: true,
                  },
                },
                Region: true,
                DoulaGallery: true,
              },
            },
            notes: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const baseUser = {
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      is_active: user.is_active,
      role: user.role,
    };

    switch (user.role) {
      /* ===================== ADMIN ===================== */
      case Role.ADMIN:
        return {
          role: user.role,
          user: baseUser,
          profile: user.adminProfile
            ? {
              profileId: user.adminProfile.id,
              profile_image: user.adminProfile.profile_image,
              notes: user.adminProfile.notes,
            }
            : null,
        };

      /* ===================== ZONE MANAGER ===================== */
      case Role.ZONE_MANAGER:
        return {
          role: user.role,
          user: baseUser,
          profile: user.zonemanagerprofile
            ? {
              profileId: user.zonemanagerprofile.id,
              profile_image: user.zonemanagerprofile.profile_image,

              managingRegions: user.zonemanagerprofile.managingRegion.map(
                (region) => ({
                  regionId: region.id,
                  regionName: region.regionName,
                }),
              ),

              doulas: user.zonemanagerprofile.doulas.map((doula) => ({
                doulaId: doula.id,
                doulaProfile: {
                  userId: doula.user.id,
                  name: doula.user.name,
                  email: doula.user.email,
                  phone: doula.user.phone,
                  is_active: doula.user.is_active,
                  role: doula.user.role,

                  qualification: doula.qualification,
                  description: doula.description,
                  achievements: doula.achievements,
                  yoe: doula.yoe,
                  languages: doula.languages,

                  regions: doula.Region.map((r) => ({
                    regionId: r.id,
                    regionName: r.regionName,
                  })),

                  doulaImages: doula.DoulaGallery,
                },
              })),

              notes: user.zonemanagerprofile.notes,
            }
            : null,
        };

      /* ===================== DOULA ===================== */
      case Role.DOULA:
        return {
          role: user.role,
          user: baseUser,
          profile: user.doulaProfile
            ? {
              profileId: user.doulaProfile.id,
              description: user.doulaProfile.description,
              qualification: user.doulaProfile.qualification,
              achievements: user.doulaProfile.achievements,
              yoe: user.doulaProfile.yoe,
              languages: user.doulaProfile.languages,

              regions: user.doulaProfile.Region.map((region) => ({
                regionId: region.id,
                regionName: region.regionName,
              })),

              doulaImages: user.doulaProfile.DoulaGallery,
            }
            : null,
        };

      /* ===================== CLIENT ===================== */
      case Role.CLIENT:
        return {
          role: user.role,
          user: baseUser,
          profile: user.clientProfile
            ? {
              profileId: user.clientProfile.id,
              profile_image: user.clientProfile.profile_image,
              region: user.clientProfile.region,
              address: user.clientProfile.address,
              is_verified: user.clientProfile.is_verified,
            }
            : null,
        };

      default:
        throw new BadRequestException('Unknown role or profile not assigned');
    }
  }
}
