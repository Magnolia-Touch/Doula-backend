import { DoulaService } from './doula.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
import { UpdateDoulaRegionDto } from './dto/update-doula.dto';
import { UpdateDoulaStatusDto } from './dto/update-doula-status.dto';
export declare class DoulaController {
    private readonly service;
    constructor(service: DoulaService);
    create(dto: CreateDoulaDto, req: any, files: {
        images?: Express.Multer.File[];
    }): Promise<{
        success: boolean;
        message: string;
        data: ({
            doulaProfile: ({
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
                    profile_image: string | null;
                    userId: string | null;
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
                    price: import("@prisma/client/runtime/library").Decimal;
                    serviceId: string;
                    doulaProfileId: string;
                })[];
                DoulaImages: {
                    id: string;
                    createdAt: Date;
                    doulaProfileId: string;
                    isMain: boolean;
                    url: string;
                    altText: string | null;
                    sortOrder: number;
                }[];
            } & {
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
        data: ({
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
            isAvailable: boolean | null;
            nextImmediateAvailabilityDate: Date | null;
        } | null)[];
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
    updateRegions(dto: UpdateDoulaRegionDto, req: any): Promise<{
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
                profile_image: string | null;
                userId: string | null;
            }[];
        } & {
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
        };
    }>;
    getDoulaMeetings(req: any, date?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            date: Date;
            serviceName: string;
            clientName: string;
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
    getDoulaSchedules(req: any, date?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            date: Date;
            startTime: Date;
            endTime: Date;
            serviceName: string;
            clientName: string;
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
    getDoulaScheduleCount(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            today: number;
            thisWeek: number;
        };
    }>;
    getImmediateMeeting(req: any): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        message: string;
        data: {
            clientName: string;
            serviceName: string;
            startTime: Date;
            timeToStart: string;
            meetingLink: string;
        };
    }>;
    getRatingSummary(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            averageRating: number;
            totalReviews: number;
            distribution: {
                5: number;
                4: number;
                3: number;
                2: number;
                1: number;
            };
        };
    }>;
    getDoulaTestimonials(req: any, page?: string, limit?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            clientId: string;
            clientName: string;
            email: string;
            phone: string | null;
            ratings: number;
            reviews: string;
            createdAt: Date;
            serviceName: string;
            servicePricingId: string;
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
    getDoulaProfile(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            title: string;
            averageRating: number;
            totalReviews: number;
            births: number;
            experience: number;
            satisfaction: number;
            contact: {
                email: string;
                phone: string | null;
                location: string;
            };
            about: string | null;
            certifications: string[];
            gallery: {
                id: string;
                url: string;
                altText: string | null;
            }[];
        };
    }>;
    uploadDoulaImage(req: any, file: Express.Multer.File, isMain?: string, sortOrder?: string, altText?: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            doulaProfileId: string;
            isMain: boolean;
            url: string;
            altText: string | null;
            sortOrder: number;
        };
    }>;
    getDoulaImages(req: any): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            doulaProfileId: string;
            isMain: boolean;
            url: string;
            altText: string | null;
            sortOrder: number;
        }[];
    }>;
    deleteDoulaImage(req: any, imageId: string): Promise<{
        message: string;
    }>;
    addGalleryImage(req: any, file: Express.Multer.File, altText?: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            doulaProfileId: string;
            url: string;
            altText: string | null;
        };
    }>;
    getGalleryImages(req: any): Promise<{
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
    deleteGalleryImage(req: any, imageId: string): Promise<{
        message: string;
    }>;
}
