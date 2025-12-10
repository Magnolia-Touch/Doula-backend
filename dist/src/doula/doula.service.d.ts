import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
import { UpdateDoulaRegionDto } from './dto/update-doula.dto';
export declare class DoulaService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateDoulaDto, userId: string, profileImageUrl?: string): Promise<{
        message: string;
        data: ({
            doulaProfile: ({
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
                    userId: string | null;
                    profile_image: string | null;
                }[];
                ServicePricing: ({
                    service: {
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
                        description: string | null;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    serviceId: string;
                    doulaProfileId: string;
                    price: import("@prisma/client/runtime/library").Decimal;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                regionId: string | null;
                profileImage: string | null;
                description: string | null;
                achievements: string | null;
                qualification: string | null;
                yoe: number | null;
                languages: import("@prisma/client/runtime/library").JsonValue | null;
            }) | null;
        } & {
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
        }) | null;
    }>;
    get(page?: number, limit?: number, search?: string, serviceId?: string, isAvailable?: boolean, isActive?: boolean, regionName?: string, minExperience?: number, serviceName?: string, startDate?: string, endDate?: string): Promise<{
        data: {
            userId: any;
            name: any;
            email: any;
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
            email: string;
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
    updateStatus(id: string, isActive: boolean): Promise<{
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
    UpdateDoulaRegions(dto: UpdateDoulaRegionDto, userId: string): Promise<{
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
                userId: string | null;
                profile_image: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
}
