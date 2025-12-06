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
        link: string;
        status: import("@prisma/client").$Enums.MeetingStatus;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        slotId: string;
        bookedById: string;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        doulaProfileId: string | null;
        adminProfileId: string | null;
        serviceId: string | null;
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
            link: string;
            status: import("@prisma/client").$Enums.MeetingStatus;
            remarks: string | null;
            createdAt: Date;
            updatedAt: Date;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            slotId: string;
            bookedById: string;
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
    getMeetingById(id: string, user: any): Promise<{
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
        status: import("@prisma/client").$Enums.MeetingStatus;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        slotId: string;
        bookedById: string;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        doulaProfileId: string | null;
        adminProfileId: string | null;
        serviceId: string | null;
    }>;
    cancelMeeting(dto: cancelDto, user: any): Promise<{
        message: string;
    }>;
    rescheduleMeeting(dto: RescheduleDto, user: any): Promise<{
        id: string;
        link: string;
        status: import("@prisma/client").$Enums.MeetingStatus;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        cancelledAt: Date | null;
        rescheduledAt: Date | null;
        slotId: string;
        bookedById: string;
        availableSlotsForMeetingId: string | null;
        zoneManagerProfileId: string | null;
        doulaProfileId: string | null;
        adminProfileId: string | null;
        serviceId: string | null;
    }>;
    updateMeetingStatus(dto: UpdateStatusDto, user: any): Promise<{
        message: string;
        meeting: {
            id: string;
            link: string;
            status: import("@prisma/client").$Enums.MeetingStatus;
            remarks: string | null;
            createdAt: Date;
            updatedAt: Date;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            slotId: string;
            bookedById: string;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            doulaProfileId: string | null;
            adminProfileId: string | null;
            serviceId: string | null;
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
            link: string;
            status: import("@prisma/client").$Enums.MeetingStatus;
            remarks: string | null;
            createdAt: Date;
            updatedAt: Date;
            cancelledAt: Date | null;
            rescheduledAt: Date | null;
            slotId: string;
            bookedById: string;
            availableSlotsForMeetingId: string | null;
            zoneManagerProfileId: string | null;
            doulaProfileId: string | null;
            adminProfileId: string | null;
            serviceId: string | null;
        };
    }>;
}
