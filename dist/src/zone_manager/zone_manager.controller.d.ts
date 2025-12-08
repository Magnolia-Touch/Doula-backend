import { ZoneManagerService } from './zone_manager.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
import { RegionAssignmentCheckDto, UpdateZoneManagerRegionDto } from './dto/update-zone-manager.dto';
export declare class ZoneManagerController {
    private readonly service;
    constructor(service: ZoneManagerService);
    create(dto: CreateZoneManagerDto, files: {
        profile_image?: Express.Multer.File[];
    }): Promise<{
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
    getZoneManagers(page?: number, limit?: number, search?: string): Promise<{
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
    getZoneManagerById(id: string): Promise<{
        message: string;
        data: {
            zonemanagerprofile: ({
                managingRegion: {
                    id: string;
                    is_active: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    regionName: string;
                    pincode: string;
                    district: string;
                    state: string;
                    country: string;
                    latitude: string;
                    longitude: string;
                    zoneManagerId: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                profile_image: string | null;
                userId: string | null;
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
    UpdateManagerStatus(id: string, isActive: boolean): Promise<{
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
    assignRegionToManager(dto: UpdateZoneManagerRegionDto): Promise<{
        message: string;
    } | undefined>;
    regionAlreadyAssignedOrNot(dto: RegionAssignmentCheckDto): Promise<{
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
