import { PrismaService } from 'src/prisma/prisma.service';
import { MeetingStatus, Role } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { RescheduleDto } from './dto/reschedule.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ScheduleDoulaDto, UpdateClientDoulaEnquiryDto } from './dto/schedule-doula.dto';
export declare class MeetingsService {
    private readonly prisma;
    private readonly mail;
    constructor(prisma: PrismaService, mail: MailerService);
    scheduleMeeting(Form: any, clientId: string, profileId: string, role: Role, enquiryId: string, slotParentId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string;
        serviceId: string | null;
        doulaProfileId: string | null;
        startTime: Date;
        endTime: Date;
        date: Date;
        status: import("@prisma/client").$Enums.MeetingStatus;
        serviceName: string;
        remarks: string | null;
        bookedById: string;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        adminProfileId: string | null;
        enquiryId: string | null;
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
    rescheduleMeeting(dto: RescheduleDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string;
        serviceId: string | null;
        doulaProfileId: string | null;
        startTime: Date;
        endTime: Date;
        date: Date;
        status: import("@prisma/client").$Enums.MeetingStatus;
        serviceName: string;
        remarks: string | null;
        bookedById: string;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        adminProfileId: string | null;
        enquiryId: string | null;
    }>;
    updateMeetingStatus(dto: UpdateStatusDto, userId: string): Promise<{
        message: string;
        meeting: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            link: string;
            serviceId: string | null;
            doulaProfileId: string | null;
            startTime: Date;
            endTime: Date;
            date: Date;
            status: import("@prisma/client").$Enums.MeetingStatus;
            serviceName: string;
            remarks: string | null;
            bookedById: string;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            adminProfileId: string | null;
            enquiryId: string | null;
        };
    }>;
    deleteAllMeetings(user: any): Promise<{
        message: string;
        count: number;
    }>;
    doulasMeetingSchedule(dto: ScheduleDoulaDto, user: any): Promise<{
        id: any;
        clientId: any;
        clientName: any;
        clientEmail: any;
        clientPhone: any;
        clientAddress: any;
        doulaId: any;
        doulaName: any;
        doulaEmail: any;
        date: any;
        time: any;
        notes: any;
        status: any;
        serviceName: any;
    }[]>;
    doulaMeeings(userId: string, role: Role, page?: number, limit?: number): Promise<{
        data: {
            id: any;
            clientId: any;
            clientName: any;
            clientEmail: any;
            clientPhone: any;
            clientAddress: any;
            doulaId: any;
            doulaName: any;
            doulaEmail: any;
            date: any;
            time: any;
            notes: any;
            status: any;
            serviceName: any;
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
    doulaMeeingsRetrieve(id: string): Promise<{
        id: any;
        clientId: any;
        clientName: any;
        clientEmail: any;
        clientPhone: any;
        clientAddress: any;
        doulaId: any;
        doulaName: any;
        doulaEmail: any;
        date: any;
        time: any;
        notes: any;
        status: any;
        serviceName: any;
    }>;
    updateDoulaMeeting(id: string, dto: UpdateClientDoulaEnquiryDto, userId: string): Promise<{
        id: any;
        clientId: any;
        clientName: any;
        clientEmail: any;
        clientPhone: any;
        clientAddress: any;
        doulaId: any;
        doulaName: any;
        doulaEmail: any;
        date: any;
        time: any;
        notes: any;
        status: any;
        serviceName: any;
    }>;
    deleteDoulaMeeting(id: string, userId: string): Promise<{
        message: string;
    }>;
    updateDoulaMeetingsStatus(id: string, userId: string, role: Role, status: MeetingStatus): Promise<{
        id: any;
        clientId: any;
        clientName: any;
        clientEmail: any;
        clientPhone: any;
        clientAddress: any;
        doulaId: any;
        doulaName: any;
        doulaEmail: any;
        date: any;
        time: any;
        notes: any;
        status: any;
        serviceName: any;
    }>;
    findAllmeetings(): Promise<({
        DoulaProfile: {
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
            languages: import("@prisma/client/runtime/library").JsonValue | null;
            specialities: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        AvailableSlotsForMeeting: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerRole: import("@prisma/client").$Enums.Role;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            doulaId: string | null;
            adminId: string | null;
            zoneManagerId: string | null;
        } | null;
        ZoneManagerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            profile_image: string | null;
        } | null;
        Service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
        AdminProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
        } | null;
        bookedBy: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
            is_verified: boolean;
            region: string | null;
            address: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string;
        serviceId: string | null;
        doulaProfileId: string | null;
        startTime: Date;
        endTime: Date;
        date: Date;
        status: import("@prisma/client").$Enums.MeetingStatus;
        serviceName: string;
        remarks: string | null;
        bookedById: string;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        adminProfileId: string | null;
        enquiryId: string | null;
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
    private includeRelations;
    private formatResponse;
}
