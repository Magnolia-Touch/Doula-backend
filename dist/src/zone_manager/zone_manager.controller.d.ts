import { ZoneManagerService } from './zone_manager.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
import { BookingStatus, ServiceStatus } from '@prisma/client';
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
    getZoneManagerById(id: string): Promise<{
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
                languages: import("@prisma/client/runtime/library").JsonValue;
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
    getSchedules(req: any, page?: string, limit?: string, status?: ServiceStatus, serviceName?: string, date?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            scheduleId: string;
            clientId: string;
            clientName: string;
            doulaId: string;
            doulaName: string;
            serviceName: string;
            startDate: Date;
            endDate: Date;
            duration: string;
            status: import("@prisma/client").$Enums.ServiceStatus;
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
    getBookedServices(req: any, page?: string, limit?: string, serviceName?: string, status?: BookingStatus, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            bookingId: string;
            clientId: string;
            clientName: string;
            doulaId: string;
            doulaName: string;
            servicePricingId: string;
            serviceName: string;
            startDate: Date;
            endDate: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
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
    getZoneManagerMeetings(req: any, page?: string, limit?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            meetingId: string;
            clientId: string;
            clientName: string;
            doulaId: string | null;
            doulaName: string | null;
            servicePricingId: string | null;
            serviceName: string;
            startDate: Date;
            endDate: Date;
            status: import("@prisma/client").$Enums.MeetingStatus;
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
    getScheduleById(req: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            clientId: string;
            clientName: string;
            doulaId: string;
            doulaName: string;
            serviceName: string;
            startDate: Date;
            endDate: Date;
            duration: string;
            status: import("@prisma/client").$Enums.ServiceStatus;
        };
    }>;
    getBookedServiceById(req: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            clientId: string;
            clientName: string;
            doulaId: string;
            doulaName: string;
            servicePricingId: string;
            serviceName: string;
            startDate: Date;
            endDate: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
        };
    }>;
    getMeetingById(req: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            clientId: string;
            clientName: string;
            doulaId: string | null;
            doulaName: string | null;
            servicePricingId: string | null;
            serviceName: string;
            startDate: Date;
            endDate: Date;
            status: import("@prisma/client").$Enums.MeetingStatus;
        };
    }>;
}
