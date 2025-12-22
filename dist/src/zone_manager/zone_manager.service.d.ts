import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
import { Prisma } from '@prisma/client';
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
                profile_image: string | null;
                userId: string | null;
            } | null;
        } & {
            name: string;
            email: string;
            phone: string | null;
            id: string;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    get(page?: number, limit?: number, search?: string): Promise<{
        message: string;
        data: {
            userId: string;
            name: string;
            email: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            profileId: string | null;
            regions: string[];
            doulas: string[];
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getById(id: string): Promise<{
        message: string;
        data: {
            userId: string;
            name: string;
            email: string;
            phone: string | null;
            role: "ZONE_MANAGER";
            is_active: boolean;
            profileId: string | null;
            regions: {
                id: string;
                regionName: string;
                pincode: string;
                district: string;
                state: string;
                country: string;
                latitude: string;
                longitude: string;
                is_active: boolean;
            }[];
            doulas: {
                doulaProfileId: string;
                userId: string;
                name: string;
                email: string;
                phone: string | null;
                is_active: boolean;
                description: string | null;
                qualification: string | null;
                achievements: string | null;
                yoe: number | null;
                languages: Prisma.JsonValue;
                regions: {
                    id: string;
                    regionName: string;
                    pincode: string;
                    district: string;
                    state: string;
                    country: string;
                }[];
            }[];
        };
    }>;
    delete(id: string): Promise<{
        message: string;
        data: null;
    }>;
    updateStatus(id: string, isActive: boolean): Promise<{
        message: string;
        data: {
            name: string;
            email: string;
            phone: string | null;
            id: string;
            otp: string | null;
            otpExpiresAt: Date | null;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
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
            regionName: string;
            zoneManagerId: string | null;
        }[];
        unassigned: {
            id: string;
            regionName: string;
            zoneManagerId: string | null;
        }[];
    }>;
}
