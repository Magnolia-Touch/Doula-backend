import { MeetingsService } from './meetings.service';
import { ScheduleDoulaDto, UpdateClientDoulaEnquiryDto, UpdateMeetingStatusDto } from './dto/schedule-doula.dto';
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
    }[]>;
    findAll(req: any, page?: string, limit?: string): Promise<{
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
    updateStatus(id: string, dto: UpdateMeetingStatusDto, req: any): Promise<{
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
    }>;
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, dto: UpdateClientDoulaEnquiryDto, req: any): Promise<{
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
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    rescheduleMeeting(dto: RescheduleDto, req: any): Promise<{
        id: string;
        link: string;
        status: import("@prisma/client").$Enums.MeetingStatus;
        startTime: Date;
        endTime: Date;
        date: Date;
        serviceName: string;
        remarks: string | null;
        bookedById: string;
        createdAt: Date;
        updatedAt: Date;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        doulaProfileId: string | null;
        adminProfileId: string | null;
        serviceId: string | null;
        enquiryId: string | null;
    }>;
    updateMeetingStatus(dto: UpdateStatusDto, req: any): Promise<{
        message: string;
        meeting: {
            id: string;
            link: string;
            status: import("@prisma/client").$Enums.MeetingStatus;
            startTime: Date;
            endTime: Date;
            date: Date;
            serviceName: string;
            remarks: string | null;
            bookedById: string;
            createdAt: Date;
            updatedAt: Date;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            doulaProfileId: string | null;
            adminProfileId: string | null;
            serviceId: string | null;
            enquiryId: string | null;
        };
    }>;
    deleteAllMeetings(req: any): Promise<{
        message: string;
        count: number;
    }>;
    getAllMeetings(): Promise<({
        bookedBy: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            region: string | null;
            userId: string;
            is_verified: boolean;
            address: string | null;
            profile_image: string | null;
        };
        AvailableSlotsForMeeting: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            ownerRole: import("@prisma/client").$Enums.Role;
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
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string | null;
            userId: string;
            profile_image: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            languages: import("@prisma/client/runtime/library").JsonValue | null;
            specialities: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        AdminProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profile_image: string | null;
        } | null;
        Service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        link: string;
        status: import("@prisma/client").$Enums.MeetingStatus;
        startTime: Date;
        endTime: Date;
        date: Date;
        serviceName: string;
        remarks: string | null;
        bookedById: string;
        createdAt: Date;
        updatedAt: Date;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        doulaProfileId: string | null;
        adminProfileId: string | null;
        serviceId: string | null;
        enquiryId: string | null;
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
