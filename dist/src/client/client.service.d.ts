import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateClientDto): Promise<{
        message: string;
        data: {
            clientProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                profile_image: string | null;
                is_verified: boolean;
                region: string | null;
                address: string | null;
            } | null;
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
        };
    }>;
    get(): Promise<{
        message: string;
        data: ({
            clientProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                profile_image: string | null;
                is_verified: boolean;
                region: string | null;
                address: string | null;
            } | null;
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
        })[];
    }>;
    getById(id: string): Promise<{
        message: string;
        data: {
            clientProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                profile_image: string | null;
                is_verified: boolean;
                region: string | null;
                address: string | null;
            } | null;
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
        };
    }>;
    delete(id: string): Promise<{
        message: string;
        data: null;
    }>;
    bookedServices(userId: string): Promise<{
        userId: string;
        name: string;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        profileId: string;
        serviceBookingId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        startDate: Date;
        endDate: Date;
        regionName: string;
        serviceId: string;
        servicePricingId: string;
        service: string;
        doulaName: string;
        mainDoulaImage: string | null;
    }[]>;
    bookedServiceById(userId: string, serviceBookingId: string): Promise<{
        userId: string;
        name: string;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        profileId: string;
        serviceBookingId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        startDate: Date;
        endDate: Date;
        regionName: string;
        serviceId: string;
        servicePricingId: string;
        service: string;
        doulaName: string;
        mainDoulaImage: string | null;
    }>;
    cancelServiceBooking(userId: string, serviceBookingId: string): Promise<{
        message: string;
        serviceBookingId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
    }>;
    Meetings(userId: string): Promise<{
        clientId: string;
        clientName: string;
        clientEmail: string;
        clientPhone: string | null;
        clientProfileId: string;
        meetingId: string;
        meetingWith: string | null;
        hostname: string | null;
        meetingDate: Date;
        weekday: import("@prisma/client").$Enums.WeekDays | null;
        startTime: Date;
        endTime: Date;
        link: string;
        serviceName: string;
        remarks: string | null;
        status: import("@prisma/client").$Enums.MeetingStatus;
    }[]>;
    meetingById(userId: string, meetingId: string): Promise<{
        clientId: string;
        clientName: string;
        clientEmail: string;
        clientPhone: string | null;
        clientProfileId: string;
        meetingId: string;
        meetingWith: string | null;
        hostname: string | null;
        meetingDate: Date;
        weekday: import("@prisma/client").$Enums.WeekDays | null;
        startTime: Date;
        endTime: Date;
        link: string;
        serviceName: string;
        remarks: string | null;
        status: import("@prisma/client").$Enums.MeetingStatus;
        createdAt: Date;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
    }>;
    cancelMeeting(userId: string, meetingId: string): Promise<{
        message: string;
        meetingId: string;
        status: import("@prisma/client").$Enums.MeetingStatus;
        cancelledAt: Date | null;
    }>;
    recentActivity(userId: string): Promise<{
        type: string;
        title: string;
        description: string;
        date: Date;
    }[]>;
    profile(userId: string): Promise<{
        userId: string;
        name: string;
        email: string;
        phone: string | null;
        profile_image: string | null;
        region: string | null;
        profileId: string;
        address: string | null;
        memberSince: Date;
    }>;
    updateProfile(userId: string, dto: UpdateClientDto): Promise<{
        userId: string;
        name: string;
        email: string;
        phone: string | null;
        profileId: string;
        profile_image: string | null;
        address: string | null;
        region: string | null;
        memberSince: Date;
    }>;
    addClientProfileImage(userId: string, profileImageUrl?: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
            is_verified: boolean;
            region: string | null;
            address: string | null;
        };
    }>;
    getClientProfileImages(userId: string): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            profile_image: string | null;
        };
    }>;
    deleteClientProfileImage(userId: string): Promise<{
        message: string;
    }>;
}
