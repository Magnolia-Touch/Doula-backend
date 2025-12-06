import { MeetingsService } from './meetings.service';
import { ScheduleDoulaDto } from './dto/schedule-doula.dto';
import { cancelDto } from './dto/cancel.dto';
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
            id: string;
            link: string;
            slotId: string;
            status: import("@prisma/client").$Enums.MeetingStatus;
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
    getMeetingById(id: string, req: any): Promise<{
        slot: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            availabe: boolean;
            isBooked: boolean;
            dateId: string;
        };
        bookedBy: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            address: string | null;
            profile_image: string | null;
        };
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
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
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
        slotId: string;
        status: import("@prisma/client").$Enums.MeetingStatus;
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
    }>;
    scheduleDoulaMeeting(dto: ScheduleDoulaDto, req: any): Promise<{
        message: string;
        meeting: {
            id: string;
            link: string;
            slotId: string;
            status: import("@prisma/client").$Enums.MeetingStatus;
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
        };
    }>;
    cancelMeeting(dto: cancelDto, req: any): Promise<{
        message: string;
    }>;
    rescheduleMeeting(dto: RescheduleDto, req: any): Promise<{
        id: string;
        link: string;
        slotId: string;
        status: import("@prisma/client").$Enums.MeetingStatus;
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
    }>;
    updateMeetingStatus(dto: UpdateStatusDto, req: any): Promise<{
        message: string;
        meeting: {
            id: string;
            link: string;
            slotId: string;
            status: import("@prisma/client").$Enums.MeetingStatus;
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
        };
    }>;
    deleteAllMeetings(req: any): Promise<{
        message: string;
        count: number;
    }>;
}
