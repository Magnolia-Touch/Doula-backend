import { WeekDays } from '@prisma/client';
export declare class AvailableSlotsForMeetingDto {
    weekday: WeekDays;
    startTime: string;
    endTime: string;
}
export declare class UpdateSlotsForMeetingTimeDto {
    timeSlotId: string;
    startTime: string;
    endTime: string;
}
