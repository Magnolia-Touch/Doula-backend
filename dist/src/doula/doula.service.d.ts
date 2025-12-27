import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
import { Prisma } from '@prisma/client';
import { UpdateDoulaRegionDto } from './dto/update-doula-region.dto';
import { UpdateDoulaProfileDto } from './dto/update-doula.dto';
import { UpdateCertificateDto } from './dto/certificate.dto';
export declare class DoulaService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateDoulaDto, userId: string, images?: {
        url: string;
    }[], profileImageUrl?: string): Promise<{
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
                Region: {
                    id: string;
                    regionName: string;
                    pincode: string;
                    zoneManagerId: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                regionId: string | null;
                profile_image: string | null;
                description: string | null;
                achievements: string | null;
                qualification: string | null;
                yoe: number | null;
                languages: Prisma.JsonValue | null;
                specialities: Prisma.JsonValue | null;
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
            specialities: Prisma.JsonValue | undefined;
            description: string | null;
            qualification: string | null;
            profileImage: string | null;
            serviceNames: ({
                servicePricingId: string;
                serviceId: string;
                serviceName: string;
                price: Prisma.JsonValue;
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
            zoneManager: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                profile_image: string | null;
            }[];
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            regionId: string | null;
            profile_image: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: Prisma.JsonValue | null;
            specialities: Prisma.JsonValue | null;
        };
    }>;
    getDoulaMeetings(user: any, page?: number, limit?: number, date?: string): Promise<{
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
    getDoulaMeetingDetail(user: any, meetingId: string): Promise<{
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
    getDoulaSchedules(user: any, page?: number, limit?: number, date?: string): Promise<{
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
    getDoulaScheduleDetail(user: any, scheduleId: string): Promise<{
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
                price: Prisma.JsonValue;
            };
            client: {
                clientId: string;
                name: string;
                email: string;
            } | null;
        };
    }>;
    getDoulaScheduleCount(user: any): Promise<{
        success: boolean;
        message: string;
        data: {
            today: number;
            thisWeek: number;
        };
    }>;
    ImmediateMeeting(user: any): Promise<{
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
    getDoulaRatingSummary(user: any): Promise<{
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
    getDoulaTestimonials(user: any, page?: number, limit?: number): Promise<{
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
    doulaProfile(user: any): Promise<{
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
            servicePricing: {
                servicePricingid: string;
                servicename: string;
                price: Prisma.JsonValue;
            }[];
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
    addDoulaprofileImage(userId: string, profileImageUrl?: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            regionId: string | null;
            profile_image: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: Prisma.JsonValue | null;
            specialities: Prisma.JsonValue | null;
        };
    }>;
    getDoulaImages(userId: string): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            profile_image: string | null;
        };
    }>;
    deleteDoulaprofileImage(userId: string): Promise<{
        message: string;
    }>;
    addDoulaGalleryImages(userId: string, files: Express.Multer.File[], altText?: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            url: string;
            altText: string | null;
        }[];
    }>;
    getDoulaGalleryImages(userId: string): Promise<{
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
    deleteDoulaGalleryImage(userId: string, imageId: string): Promise<{
        message: string;
    }>;
    updateDoulaProfile(userId: string, dto: UpdateDoulaProfileDto): Promise<{
        message: string;
    }>;
    private getDoulaProfile;
    getCertificates(userId: string): Promise<{
        id: string;
        name: string;
        doulaProfileId: string;
        issuedBy: string;
        year: string;
    }[]>;
    getCertificateById(userId: string, certificateId: string): Promise<{
        id: string;
        name: string;
        doulaProfileId: string;
        issuedBy: string;
        year: string;
    }>;
    updateCertificate(userId: string, certificateId: string, dto: UpdateCertificateDto): Promise<{
        id: string;
        name: string;
        doulaProfileId: string;
        issuedBy: string;
        year: string;
    }>;
    deleteCertificate(userId: string, certificateId: string): Promise<{
        message: string;
    }>;
    getServiceBookings(userId: string, page?: number, limit?: number): Promise<{
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
    getServiceBookingsinDetail(userId: string, serviceBookingId: string): Promise<{
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
            price: Prisma.JsonValue;
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
