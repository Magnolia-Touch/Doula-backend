import { MeetingStatus } from '@prisma/client';
export declare class UpdateStatusDto {
    meetingId: string;
    status: MeetingStatus;
}
