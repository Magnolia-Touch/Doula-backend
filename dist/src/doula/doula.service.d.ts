import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
import { UpdateDoulaRegionDto } from './dto/update-doula.dto';
export declare class DoulaService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateDoulaDto, userId: string, profileImageUrl?: string): Promise<{
        message: string;
        data: {
            doulaProfile: ({
                languages: {
                    id: string;
                    name: string;
                }[];
                zoneManager: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string | null;
                    profile_image: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                regionId: string | null;
                profileImage: string | null;
                description: string | null;
                achievements: string | null;
                qualification: string | null;
                yoe: number | null;
                userId: string;
            }) | null;
        } & {
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
    get(page?: number, limit?: number, search?: string, serviceId?: string, isAvailable?: boolean, isActive?: boolean): Promise<{
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
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
        message: string;
    }>;
    getById(id: string): Promise<{
        message: string;
        data: {
            doulaProfile: ({
                languages: {
                    id: string;
                    name: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                regionId: string | null;
                profileImage: string | null;
                description: string | null;
                achievements: string | null;
                qualification: string | null;
                yoe: number | null;
                userId: string;
            }) | null;
        } & {
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
    delete(id: string): Promise<{
        message: string;
        data: null;
    }>;
    updateStatus(id: string, isActive: boolean): Promise<{
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
    UpdateDoulaRegions(dto: UpdateDoulaRegionDto, userId: string): Promise<{
        message: string;
        data: {
            Region: {
                id: string;
                is_active: boolean;
                createdAt: Date;
                updatedAt: Date;
                pincode: string;
                regionName: string;
                district: string;
                state: string;
                country: string;
                latitude: string;
                longitude: string;
                zoneManagerId: string | null;
            }[];
            zoneManager: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                profile_image: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            userId: string;
        };
    }>;
}
