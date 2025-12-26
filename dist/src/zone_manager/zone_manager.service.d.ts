import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
import { BookingStatus, MeetingStatus, Prisma, ServiceStatus } from '@prisma/client';
import { UpdateZoneManagerRegionDto } from './dto/update-zone-manager.dto';
import { UpdateDoulaProfileDto } from 'src/doula/dto/update-doula.dto';
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
    getZoneManagerSchedules(userId: string, page?: number, limit?: number, filters?: {
        status?: ServiceStatus;
        serviceName?: string;
        date?: string;
    }): Promise<{
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
    getZoneManagerBookedServices(userId: string, page?: number, limit?: number, filters?: {
        serviceName?: string;
        status?: BookingStatus;
        startDate?: string;
        endDate?: string;
    }): Promise<{
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
    getZoneManagerMeetings(userId: string, page?: number, limit?: number, search?: string, status?: MeetingStatus): Promise<{
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
    getZoneManagerScheduleById(userId: string, scheduleId: string): Promise<{
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
        };
    }>;
    getZoneManagerBookedServiceById(userId: string, bookingId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            serviceBookingId: string;
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
    getZoneManagerMeetingById(userId: string, meetingId: string): Promise<{
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
        };
    }>;
    getDoulasUnderZm(userId: string): Promise<{
        status: string;
        message: string;
        data: {
            userId: string;
            profileid: string;
            name: string;
            email: string;
            phone: string | null;
            yoe: number | null;
            qualification: string | null;
            languages: Prisma.JsonValue;
            specialities: Prisma.JsonValue;
            profileImage: string | null;
        }[];
    }>;
    addDoulaGalleryImages(doulaId: string, files: Express.Multer.File[], userId: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            url: string;
            altText: string | null;
        }[];
    }>;
    getDoulaGalleryImages(doulaId: string, userId: string): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            doulaProfileId: string;
            url: string;
            altText: string | null;
        }[];
    }>;
    deleteDoulaGalleryImage(doulaId: string, imageId: string, userId: string): Promise<{
        message: string;
    }>;
    updateDoulaProfile(doulaId: string, dto: UpdateDoulaProfileDto, userId: string): Promise<{
        message: string;
        data: [{
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
        }, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
            regionId: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: Prisma.JsonValue | null;
            specialities: Prisma.JsonValue | null;
        }];
    }>;
}
