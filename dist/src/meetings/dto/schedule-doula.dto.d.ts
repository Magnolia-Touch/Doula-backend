import { MeetingStatus } from '@prisma/client';
export declare class ScheduleDoulaDto {
    enquiryId: string;
    date: string;
    time: string;
    notes?: string;
    serviceName?: string;
    doulaIds: string[];
}
export declare class UpdateClientDoulaEnquiryDto {
    date: string;
    time: string;
    notes?: string;
    doulaId: string;
}
export declare class UpdateMeetingStatusDto {
    status: MeetingStatus;
}
