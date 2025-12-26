import { MeetingsService } from './meetings.service';
import { ScheduleDoulaDto } from './dto/schedule-doula.dto';
import { RescheduleDto } from './dto/reschedule.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
export declare class MeetingsController {
    private readonly service;
    constructor(service: MeetingsService);
    getMeetings(params: {
        startDate?: string;
        endDate?: string;
        status?: string;
        page?: number;
        limit?: number;
    }, req: any): Promise<{
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
    scheduleDoulaMeeting(dto: ScheduleDoulaDto, req: any): Promise<{
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
            date: Date;
            startTime: Date;
            endTime: Date;
            serviceName: string;
            remarks: string | null;
            rescheduledAt: Date | null;
            bookedById: string;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            adminProfileId: string | null;
        };
    }>;
    rescheduleMeeting(dto: RescheduleDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string;
        serviceId: string | null;
        doulaProfileId: string | null;
        status: import("@prisma/client").$Enums.MeetingStatus;
        cancelledAt: Date | null;
        date: Date;
        startTime: Date;
        endTime: Date;
        serviceName: string;
        remarks: string | null;
        rescheduledAt: Date | null;
        bookedById: string;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        adminProfileId: string | null;
    }>;
    updateMeetingStatus(dto: UpdateStatusDto, req: any): Promise<{
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
            date: Date;
            startTime: Date;
            endTime: Date;
            serviceName: string;
            remarks: string | null;
            rescheduledAt: Date | null;
            bookedById: string;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            adminProfileId: string | null;
        };
    }>;
    deleteAllMeetings(req: any): Promise<{
        message: string;
        count: number;
    }>;
    getAllMeetings(): Promise<({
        ZoneManagerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            profile_image: string | null;
        } | null;
        DoulaProfile: {
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
        } | null;
        Service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
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
        AdminProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
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
        date: Date;
        startTime: Date;
        endTime: Date;
        serviceName: string;
        remarks: string | null;
        rescheduledAt: Date | null;
        bookedById: string;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        adminProfileId: string | null;
    })[]>;
    getBookedMeetingsByDate(date: string, doulaProfileId?: string, zoneManagerProfileId?: string): Promise<{
        date: string;
        totalBookedSlots: number;
        bookings: {
            meetingDate: Date;
            startTime: Date;
            endTime: Date;
        }[];
    }>;
    getMeetingById(id: string, req: any): Promise<{
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
}
