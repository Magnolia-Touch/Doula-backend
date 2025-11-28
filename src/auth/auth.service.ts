import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
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
import { create } from 'domain';

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
        const { name, email, phone } = dto
        console.log(dto.email)
        let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (user) {
            throw new Error("User with this email already exists")
        }
        console.log(user)
        const created = await this.prisma.user.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                role: Role.ADMIN,

            }
        });
        return { message: "Otp Sent Succesfully", data: created }
    }

    async LoginOtp(dto: LoginDto) {

        const { email } = dto
        const otp = generate6DigitOtp();
        let user = await this.prisma.user.findUnique({ where: { email: email } });
        //if no user throw error.
        if (!user) {
            throw new Error("No User Found")
        }
        if (user.role == Role.DOULA || user.role == Role.ADMIN || user.role == Role.ZONE_MANAGER) {
            await this.prisma.user.update({
                where: { email: email },
                data: {
                    otp: otp,
                    otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
                }
            })
            await this.mailerService.sendMail({
                to: dto.email,
                subject: 'Login OTP',
                template: 'authentication', // ✅ refers to authentication.pug
                context: {
                    otp, // ✅ available inside the template
                },
            });
            return { message: "Otp Sent Succesfully", data: otp }
        }
        else {
            throw new Error("Invalid Role.")
        }

    }


    async verifyOtp(dto: OtpVerifyDto) {
        const { email, otp } = dto
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
            message: "User Verified Successfully",
            status: 200,
        };
    }


}
