import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { RescheduleDto } from './dto/reschedule.dto';
import { cancelDto } from './dto/cancel.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ScheduleDoulaDto } from './dto/schedule-doula.dto';
export declare class MeetingsService {
    private readonly prisma;
    private readonly mail;
    constructor(prisma: PrismaService, mail: MailerService);
    scheduleMeeting(Form: any, clientId: string, profileId: string, role: Role, slotParentId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string;
        serviceId: string | null;
        doulaProfileId: string | null;
        status: import("@prisma/client").$Enums.MeetingStatus;
        cancelledAt: Date | null;
        startTime: Date;
        endTime: Date;
        date: Date;
        serviceName: string;
        remarks: string | null;
        rescheduledAt: Date | null;
        bookedById: string;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        adminProfileId: string | null;
    }>;
    getMeetings(params: {
        startDate?: string;
        endDate?: string;
        status?: string;
        page?: number;
        limit?: number;
    }, user: any): Promise<{
        data: {
            meetingId: any;
            meetingLink: any;
            meetingStatus: any;
            meetingStartTime: any;
            meetingEndTime: any;
            meetingDate: any;
            weekday: any;
            serviceName: any;
            remarks: any;
            meeting_with: string | null;
            client: {
                clientId: any;
                clientName: any;
                clientEmail: any;
                clientPhone: any;
            };
            doula: {
                doulaId: any;
                doulaProfileId: any;
                doulaName: any;
                doulaEmail: any;
                doulaPhone: any;
            } | null;
            zoneManager: {
                zoneManagerId: any;
                zoneManagerProfileId: any;
                zoneManagerName: any;
                zoneManagerEmail: any;
            } | null;
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
    getMeetingById(id: string, user: any): Promise<{
        meetingId: string;
        meetingLink: string;
        meetingStatus: import("@prisma/client").$Enums.MeetingStatus;
        meetingStartTime: Date;
        meetingEndTime: Date;
        meetingDate: Date;
        weekday: import("@prisma/client").$Enums.WeekDays | null;
        serviceName: string;
        remarks: string | null;
        meeting_with: string | null;
        client: {
            clientId: string;
            clientName: string;
            clientEmail: string;
            clientPhone: string | null;
        };
        doula: {
            doulaId: string | undefined;
            doulaProfileId: string | undefined;
            doulaName: string | undefined;
            doulaEmail: string | undefined;
            doulaPhone: string | null | undefined;
        } | null;
        zoneManager: {
            zoneManagerId: string | undefined;
            zoneManagerProfileId: string | undefined;
            zoneManagerName: string | undefined;
            zoneManagerEmail: string | undefined;
        } | null;
    }>;
    cancelMeeting(dto: cancelDto, user: any): Promise<{
        message: string;
    }>;
    rescheduleMeeting(dto: RescheduleDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string;
        serviceId: string | null;
        doulaProfileId: string | null;
        status: import("@prisma/client").$Enums.MeetingStatus;
        cancelledAt: Date | null;
        startTime: Date;
        endTime: Date;
        date: Date;
        serviceName: string;
        remarks: string | null;
        rescheduledAt: Date | null;
        bookedById: string;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        adminProfileId: string | null;
    }>;
    updateMeetingStatus(dto: UpdateStatusDto, user: any): Promise<{
        message: string;
        meeting: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            link: string;
            serviceId: string | null;
            doulaProfileId: string | null;
            status: import("@prisma/client").$Enums.MeetingStatus;
            cancelledAt: Date | null;
            startTime: Date;
            endTime: Date;
            date: Date;
            serviceName: string;
            remarks: string | null;
            rescheduledAt: Date | null;
            bookedById: string;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            adminProfileId: string | null;
        };
    }>;
    deleteAllMeetings(user: any): Promise<{
        message: string;
        count: number;
    }>;
    doulasMeetingSchedule(dto: ScheduleDoulaDto, user: any): Promise<{
        message: string;
        meeting: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            link: string;
            serviceId: string | null;
            doulaProfileId: string | null;
            status: import("@prisma/client").$Enums.MeetingStatus;
            cancelledAt: Date | null;
            startTime: Date;
            endTime: Date;
            date: Date;
            serviceName: string;
            remarks: string | null;
            rescheduledAt: Date | null;
            bookedById: string;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            adminProfileId: string | null;
        };
    }>;
    findAllmeetings(): Promise<({
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string;
            regionId: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: import("@prisma/client/runtime/library").JsonValue | null;
            specialities: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        Service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
        AvailableSlotsForMeeting: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            zoneManagerId: string | null;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            ownerRole: import("@prisma/client").$Enums.Role;
            doulaId: string | null;
            adminId: string | null;
        } | null;
        bookedBy: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            is_verified: boolean;
            region: string | null;
            address: string | null;
            profile_image: string | null;
            userId: string;
        };
        ZoneManagerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string | null;
        } | null;
        AdminProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string;
        serviceId: string | null;
        doulaProfileId: string | null;
        status: import("@prisma/client").$Enums.MeetingStatus;
        cancelledAt: Date | null;
        startTime: Date;
        endTime: Date;
        date: Date;
        serviceName: string;
        remarks: string | null;
        rescheduledAt: Date | null;
        bookedById: string;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        adminProfileId: string | null;
    })[]>;
    getBookedMeetingsByDate(params: {
        doulaProfileId?: string;
        zoneManagerProfileId?: string;
        date: string;
    }): Promise<{
        date: string;
        totalBookedSlots: number;
        bookings: {
            meetingDate: Date;
            startTime: Date;
            endTime: Date;
        }[];
    }>;
}
