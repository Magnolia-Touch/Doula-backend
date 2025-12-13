import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
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
                is_verified: boolean;
                region: string | null;
                address: string | null;
                profile_image: string | null;
                userId: string;
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
    get(): Promise<{
        message: string;
        data: ({
            clientProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                is_verified: boolean;
                region: string | null;
                address: string | null;
                profile_image: string | null;
                userId: string;
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
        })[];
    }>;
    getById(id: string): Promise<{
        message: string;
        data: {
            clientProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                is_verified: boolean;
                region: string | null;
                address: string | null;
                profile_image: string | null;
                userId: string;
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
        meetingId: string;
        userId: string;
        name: string;
        email: string;
        phone: string | null;
        profileId: string;
        hostname: string | null;
        date: Date;
        startTime: Date;
        endTime: Date;
        link: string;
        remarks: string | null;
        status: import("@prisma/client").$Enums.MeetingStatus;
    }[]>;
    meetingById(userId: string, meetingId: string): Promise<{
        userId: string;
        name: string;
        email: string;
        phone: string | null;
        profileId: string;
        hostname: string | null;
        date: Date;
        startTime: Date;
        endTime: Date;
        link: string;
        remarks: string | null;
        status: import("@prisma/client").$Enums.MeetingStatus;
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
        profileId: string;
        address: string | null;
        memberSince: Date;
    }>;
}
