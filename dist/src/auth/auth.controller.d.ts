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
            email: string;
            phone: string | null;
            name: string;
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
            email: string;
            phone: string | null;
            name: string;
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
            userId: string;
            email: string;
            name: string;
            phone: string | null;
            is_active: boolean;
            role: import("@prisma/client").$Enums.Role;
        };
        profile: {
            profileId: string;
            profile_image: string | null;
            notes: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                zoneManagerId: string | null;
                remarks: string;
                adminId: string | null;
            }[];
            managingRegions?: undefined;
            doulas?: undefined;
            description?: undefined;
            qualification?: undefined;
            achievements?: undefined;
            yoe?: undefined;
            languages?: undefined;
            regions?: undefined;
            doulaImages?: undefined;
            region?: undefined;
            address?: undefined;
            is_verified?: undefined;
        } | null;
    } | {
        role: "ZONE_MANAGER";
        user: {
            userId: string;
            email: string;
            name: string;
            phone: string | null;
            is_active: boolean;
            role: import("@prisma/client").$Enums.Role;
        };
        profile: {
            profileId: string;
            profile_image: string | null;
            managingRegions: {
                regionId: string;
                regionName: string;
            }[];
            doulas: {
                doulaId: string;
                doulaProfile: {
                    userId: string;
                    name: string;
                    email: string;
                    phone: string | null;
                    is_active: boolean;
                    role: import("@prisma/client").$Enums.Role;
                    qualification: string | null;
                    description: string | null;
                    achievements: string | null;
                    yoe: number | null;
                    languages: import("@prisma/client/runtime/library").JsonValue;
                    regions: {
                        regionId: string;
                        regionName: string;
                    }[];
                    doulaImages: {
                        id: string;
                        sortOrder: number;
                        doulaProfileId: string;
                        url: string;
                        altText: string | null;
                        isMain: boolean;
                    }[];
                };
            }[];
            notes: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                zoneManagerId: string | null;
                remarks: string;
                adminId: string | null;
            }[];
            description?: undefined;
            qualification?: undefined;
            achievements?: undefined;
            yoe?: undefined;
            languages?: undefined;
            regions?: undefined;
            doulaImages?: undefined;
            region?: undefined;
            address?: undefined;
            is_verified?: undefined;
        } | null;
    } | {
        role: "DOULA";
        user: {
            userId: string;
            email: string;
            name: string;
            phone: string | null;
            is_active: boolean;
            role: import("@prisma/client").$Enums.Role;
        };
        profile: {
            profileId: string;
            description: string | null;
            qualification: string | null;
            achievements: string | null;
            yoe: number | null;
            languages: import("@prisma/client/runtime/library").JsonValue;
            regions: {
                regionId: string;
                regionName: string;
            }[];
            doulaImages: {
                id: string;
                sortOrder: number;
                doulaProfileId: string;
                url: string;
                altText: string | null;
                isMain: boolean;
            }[];
            profile_image?: undefined;
            notes?: undefined;
            managingRegions?: undefined;
            doulas?: undefined;
            region?: undefined;
            address?: undefined;
            is_verified?: undefined;
        } | null;
    } | {
        role: "CLIENT";
        user: {
            userId: string;
            email: string;
            name: string;
            phone: string | null;
            is_active: boolean;
            role: import("@prisma/client").$Enums.Role;
        };
        profile: {
            profileId: string;
            profile_image: string | null;
            region: string | null;
            address: string | null;
            is_verified: boolean;
            notes?: undefined;
            managingRegions?: undefined;
            doulas?: undefined;
            description?: undefined;
            qualification?: undefined;
            achievements?: undefined;
            yoe?: undefined;
            languages?: undefined;
            regions?: undefined;
            doulaImages?: undefined;
        } | null;
    }>;
}
