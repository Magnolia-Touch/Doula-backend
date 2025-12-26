import { DoulaService } from './doula.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
import { UpdateDoulaRegionDto } from './dto/update-doula-region.dto';
import { UpdateDoulaStatusDto } from './dto/update-doula-status.dto';
import { UpdateDoulaProfileDto } from './dto/update-doula.dto';
import { UpdateCertificateDto } from './dto/certificate.dto';
export declare class DoulaController {
    private readonly service;
    constructor(service: DoulaService);
    create(dto: CreateDoulaDto, req: any, files: {
        profile_image?: Express.Multer.File[];
        gallery_image?: Express.Multer.File[];
    }): Promise<{
        success: boolean;
        message: string;
        data: ({
            doulaProfile: ({
                zoneManager: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string | null;
                    profile_image: string | null;
                }[];
                Region: {
                    id: string;
                    zoneManagerId: string | null;
                    pincode: string;
                    regionName: string;
                }[];
                ServicePricing: {
                    id: string;
                    service: {
                        name: string;
                        description: string | null;
                    };
                    serviceId: string;
                    price: import("@prisma/client/runtime/library").Decimal;
                }[];
                DoulaGallery: {
                    id: string;
                    createdAt: Date;
                    doulaProfileId: string;
                    url: string;
                    altText: string | null;
                }[];
                Certificates: {
                    id: string;
                    name: string;
                    doulaProfileId: string;
                    issuedBy: string;
                    year: string;
                }[];
            } & {
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
                languages: import("@prisma/client/runtime/library").JsonValue | null;
                specialities: import("@prisma/client/runtime/library").JsonValue | null;
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
        }) | null;
    }>;
    get(page?: number, limit?: number, search?: string, serviceId?: string, isAvailable?: boolean, isActive?: boolean, regionName?: string, minExperience?: number, serviceName?: string, startDate?: string, endDate?: string): Promise<{
        data: ({
            userId: any;
            isActive: any;
            name: any;
            email: any;
            profileId: any;
            yoe: any;
            profile_image: any;
            serviceNames: any;
            regionNames: any;
            ratings: number | null;
            reviewsCount: any;
            isAvailable: boolean | null;
            nextImmediateAvailabilityDate: Date | null;
            images: any;
            certificates: any;
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
            specialities: import("@prisma/client/runtime/library").JsonValue | undefined;
            description: string | null;
            qualification: string | null;
            profileImage: string | null;
            serviceNames: ({
                servicePricingId: string;
                serviceId: string;
                serviceName: string;
                price: import("@prisma/client/runtime/library").Decimal;
            } | null)[];
            regionNames: {
                id: string;
                name: string;
            }[];
            ratings: number | null;
            reviewsCount: number;
            nextImmediateAvailabilityDate: Date | null;
            galleryImages: {
                id: string;
                url: string;
                createdAt: Date;
            }[];
            certificates: {
                id: string;
                name: string;
                issuedBy: string;
                year: string;
            }[];
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
    updateRegions(dto: UpdateDoulaRegionDto, req: any): Promise<{
        message: string;
        data: {
            zoneManager: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                profile_image: string | null;
            }[];
            Region: {
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
            userId: string;
            profile_image: string | null;
            regionId: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: import("@prisma/client/runtime/library").JsonValue | null;
            specialities: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    getDoulaMeetings(req: any, date?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            meetingId: string;
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
    getDoulaMeetingDetail(req: any, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            meetingId: string;
            date: Date;
            startTime: Date;
            endTime: Date;
            status: import("@prisma/client").$Enums.MeetingStatus;
            serviceName: string;
            client: {
                clientId: string;
                name: string;
                email: string;
            } | null;
        };
    }>;
    getDoulaSchedules(req: any, date?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            scheduleId: string;
            date: Date;
            startTime: Date;
            endTime: Date;
            serviceName: string;
            clientName: string;
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
    getDoulaScheduleDetail(req: any, scheduleId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            scheduleId: string;
            date: Date;
            startTime: Date;
            endTime: Date;
            status: import("@prisma/client").$Enums.ServiceStatus;
            service: {
                servicePricingId: string;
                serviceId: string;
                serviceName: string;
                price: import("@prisma/client/runtime/library").Decimal;
            };
            client: {
                clientId: string;
                name: string;
                email: string;
            } | null;
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
            certificates: {
                id: string;
                name: string;
                issuedBy: string;
                year: string;
            }[];
            gallery: {
                id: string;
                url: string;
                altText: string | null;
            }[];
        };
    }>;
    uploadDoulaImage(req: any, file: Express.Multer.File): Promise<{
        message: string;
        data: {
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
            languages: import("@prisma/client/runtime/library").JsonValue | null;
            specialities: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    getDoulaImages(req: any): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            profile_image: string | null;
        };
    }>;
    deleteDoulaImage(req: any): Promise<{
        message: string;
    }>;
    addGalleryImages(req: any, files: Express.Multer.File[], altText?: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            url: string;
            altText: string | null;
        }[];
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
    updateDoulaProfile(req: any, dto: UpdateDoulaProfileDto): Promise<{
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
            languages: import("@prisma/client/runtime/library").JsonValue | null;
            specialities: import("@prisma/client/runtime/library").JsonValue | null;
        }];
    }>;
    getCertificates(req: any): Promise<{
        id: string;
        name: string;
        doulaProfileId: string;
        issuedBy: string;
        year: string;
    }[]>;
    getCertificateById(req: any, certificateId: string): Promise<{
        id: string;
        name: string;
        doulaProfileId: string;
        issuedBy: string;
        year: string;
    }>;
    updateCertificate(req: any, certificateId: string, dto: UpdateCertificateDto): Promise<{
        id: string;
        name: string;
        doulaProfileId: string;
        issuedBy: string;
        year: string;
    }>;
    deleteCertificate(req: any, certificateId: string): Promise<{
        message: string;
    }>;
    getServiceBookings(req: any, date?: string, page?: string, limit?: string): Promise<{
        data: {
            serviceBookingId: string;
            satisfiestartDate: Date;
            endDate: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
            regionId: string;
            regionName: string;
            servicePricingId: string;
            serviceName: string;
            serviceId: string;
            schedulesCount: number;
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
    getServiceBookingsinDetail(req: any, serviceBookingId: string): Promise<{
        serviceBookingId: string;
        startDate: Date;
        endDate: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        region: {
            id: string;
            name: string;
            zoneManager: {
                id: string;
                name: string;
                email: string;
            } | null;
        };
        service: {
            servicePricingId: string;
            serviceId: string;
            serviceName: string;
            price: import("@prisma/client/runtime/library").Decimal;
        };
        schedules: {
            id: string;
            date: Date;
            startTime: Date;
            endTime: Date;
            status: import("@prisma/client").$Enums.ServiceStatus;
        }[];
    }>;
}
