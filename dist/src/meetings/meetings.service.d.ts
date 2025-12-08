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
        remarks: string | null;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        slotId: string;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            link: string;
            serviceId: string | null;
            doulaProfileId: string | null;
            status: import("@prisma/client").$Enums.MeetingStatus;
            remarks: string | null;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            slotId: string;
            bookedById: string;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            adminProfileId: string | null;
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
        DoulaProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            regionId: string | null;
            profileImage: string | null;
            description: string | null;
            achievements: string | null;
            qualification: string | null;
            yoe: number | null;
            userId: string;
        } | null;
        ZoneManagerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            userId: string | null;
        } | null;
        Service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
        slot: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            availabe: boolean;
            startTime: Date;
            endTime: Date;
            isBooked: boolean;
            dateId: string;
        };
        bookedBy: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profile_image: string | null;
            address: string | null;
            userId: string;
        };
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
        remarks: string | null;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        slotId: string;
        bookedById: string;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        adminProfileId: string | null;
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
        remarks: string | null;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        slotId: string;
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
            remarks: string | null;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            slotId: string;
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
            remarks: string | null;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            slotId: string;
            bookedById: string;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            adminProfileId: string | null;
        };
    }>;
}
