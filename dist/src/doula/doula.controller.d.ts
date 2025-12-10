import { DoulaService } from './doula.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
import { UpdateDoulaRegionDto } from './dto/update-doula.dto';
import { UpdateDoulaStatusDto } from './dto/update-doula-status.dto';
export declare class DoulaController {
    private readonly service;
    constructor(service: DoulaService);
    create(dto: CreateDoulaDto, req: any, files: {
        profile_image?: Express.Multer.File[];
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            doulaProfile: ({
                zoneManager: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    profile_image: string | null;
                    userId: string | null;
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
                languages: import("@prisma/client/runtime/library").JsonValue | null;
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
    get(page?: number, limit?: number, search?: string, serviceId?: string, isAvailable?: boolean, isActive?: boolean, regionName?: string, minExperience?: number, serviceName?: string, startDate?: string, endDate?: string): Promise<{
        data: {
            userId: any;
            name: any;
            profileId: any;
            profileImage: any;
            yoe: any;
            serviceNames: any;
            regionNames: any;
            ratings: number | null;
            reviewsCount: any;
            nextImmediateAvailabilityDate: any;
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
            userId: string;
            name: string;
            profileId: string | null;
            profileImage: string | null;
            yoe: number | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            serviceNames: string[];
            regionNames: string[];
            ratings: number | null;
            reviewsCount: number;
            nextImmediateAvailabilityDate: Date | null;
            testimonials: {
                id: string;
                rating: number;
                review: string;
                clientName: string;
                clientId: string;
                serviceId: string;
                createdAt: Date;
            }[];
        };
    }>;
    delete(id: string): Promise<{
        message: string;
        data: null;
    }>;
    updateStatus(id: string, body: UpdateDoulaStatusDto): Promise<{
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
    updateRegions(dto: UpdateDoulaRegionDto, req: any): Promise<{
        message: string;
        data: {
            Region: {
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
            zoneManager: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                profile_image: string | null;
                userId: string | null;
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
            languages: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
        };
    }>;
}
