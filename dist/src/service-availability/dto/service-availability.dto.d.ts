import { WeekDays } from '@prisma/client';
export declare class CreateDoulaServiceAvailability {
    weekday: WeekDays;
    startTime: string;
    endTime: string;
}
export declare class UpdateDoulaServiceAvailabilityDTO {
    startTime: string;
    endTime: string;
    availabe?: boolean;
    isBooked?: boolean;
}
