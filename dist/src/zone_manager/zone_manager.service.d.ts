import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
import { UpdateZoneManagerRegionDto } from './dto/update-zone-manager.dto';
export declare class ZoneManagerService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateZoneManagerDto, profileImageUrl?: string): Promise<{
        message: string;
        data: {
            zonemanagerprofile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                profile_image: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            is_active: boolean;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    get(page?: number, limit?: number, search?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            is_active: boolean;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
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
            zonemanagerprofile: ({
                managingRegion: {
                    id: string;
                    zoneManagerId: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    pincode: string;
                    regionName: string;
                    district: string;
                    state: string;
                    country: string;
                    latitude: string;
                    longitude: string;
                    is_active: boolean;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                profile_image: string | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            is_active: boolean;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            is_active: boolean;
            email: string;
            phone: string | null;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    UpdateZoneManagerRegions(dto: UpdateZoneManagerRegionDto): Promise<{
        message: string;
    } | undefined>;
    regionAlreadyAssignedOrNot(regionIds: string[]): Promise<{
        message: string;
        assignedCount: number;
        unassignedCount: number;
        assigned: {
            id: string;
            zoneManagerId: string | null;
            regionName: string;
        }[];
        unassigned: {
            id: string;
            zoneManagerId: string | null;
            regionName: string;
        }[];
    }>;
}
