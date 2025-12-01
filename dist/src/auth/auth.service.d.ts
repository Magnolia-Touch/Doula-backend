import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsService } from 'src/client/client.service';
import { DoulaService } from 'src/doula/doula.service';
import { ZoneManagerService } from 'src/zone_manager/zone_manager.service';
import { AdminService } from 'src/admin/admin.service';
import { MailerService } from '@nestjs-modules/mailer';
import { RegistrationDto } from './dto/registration.dto';
import { LoginDto } from './dto/login.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly clients;
    private readonly admin;
    private readonly zonemanager;
    private readonly doula;
    private readonly jwtService;
    private readonly mailerService;
    constructor(prisma: PrismaService, clients: ClientsService, admin: AdminService, zonemanager: ZoneManagerService, doula: DoulaService, jwtService: JwtService, mailerService: MailerService);
    RegisterAdmin(dto: RegistrationDto): Promise<{
        message: string;
        data: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    LoginOtp(dto: LoginDto): Promise<{
        message: string;
        data: string;
    }>;
    verifyOtp(dto: OtpVerifyDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        message: string;
        status: number;
    }>;
}
