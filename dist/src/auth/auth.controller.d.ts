import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    RegistrationAdmin(dto: RegistrationDto): Promise<{
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
    myProfile(req: any): Promise<{
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
            regionId: string | null;
            description: string | null;
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
            profile_image: string | null;
            userId: string;
            is_verified: boolean;
            address: string | null;
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
