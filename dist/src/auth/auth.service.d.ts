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
    Profile(userId: string): Promise<{
        role: "ADMIN";
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            is_active: boolean;
        };
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string;
        } | null;
    } | {
        role: "DOULA";
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            is_active: boolean;
        };
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            regionId: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
    } | {
        role: "CLIENT";
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            is_active: boolean;
        };
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            is_verified: boolean;
            region: string | null;
            address: string | null;
            profile_image: string | null;
            userId: string;
        } | null;
    } | {
        role: "ZONE_MANAGER";
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            is_active: boolean;
        };
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string | null;
        } | null;
    }>;
}
