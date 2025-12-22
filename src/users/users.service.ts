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
import { UserRegistrationDto } from './dto/user-registration.dto';
@Injectable()
export class UserService {
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
    async RegisterUser(dto: UserRegistrationDto) {
        const otp = generate6DigitOtp();
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
                role: Role.CLIENT,
                otp: otp,
                otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
                clientProfile: { create: { is_verified: false } }

            }
        });
        // await this.mailerService.sendMail({
        //     to: dto.email,
        //     subject: 'Login OTP',
        //     template: 'authentication', // ✅ refers to authentication.pug
        //     context: {
        //         otp, // ✅ available inside the template
        //     },
        // });
        return { message: "Otp Sent Succesfully", data: created }
    }

    async deleteAll() {
        return this.prisma.schedules.deleteMany({});
    }



}
