import { DoulaServiceAvailabilityService } from './service-availability.service';
import { CreateDoulaServiceAvailability, UpdateDoulaServiceAvailabilityDTO } from './dto/service-availability.dto';
export declare class DoulaServiceAvailabilityController {
    private readonly service;
    constructor(service: DoulaServiceAvailabilityService);
    createSlots(dto: CreateDoulaServiceAvailability, req: any): Promise<{
        message: string;
        data: {
            date: import("@prisma/client").$Enums.WeekDays;
            ownerRole: any;
            timeslot: {
                startTime: Date;
                endTime: Date;
                available: boolean;
            };
        };
    }>;
    getMyAvailabilities(req: any): Promise<({
        AvailableSlotsTimeForService: {
            id: string;
            availabe: boolean;
            startTime: Date;
            endTime: Date;
            isBooked: boolean;
        }[];
    } & {
        id: string;
        weekday: import("@prisma/client").$Enums.WeekDays;
        availabe: boolean;
        doulaId: string;
        createdAt: Date;
        updatedAt: Date;
        isBooked: boolean;
    })[]>;
    getSlotById(id: string): Promise<{
        message: string;
        slot: {
            AvailableSlotsTimeForService: {
                id: string;
                availabe: boolean;
                createdAt: Date;
                updatedAt: Date;
                startTime: Date;
                endTime: Date;
                isBooked: boolean;
                dateId: string;
                bookingId: string | null;
                formId: string | null;
            }[];
        } & {
            id: string;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            doulaId: string;
            createdAt: Date;
            updatedAt: Date;
            isBooked: boolean;
        };
    }>;
    updateSlot(dto: UpdateDoulaServiceAvailabilityDTO, id: string, req: any): Promise<{
        message: string;
        data: {
            id: string;
            availabe: boolean;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            isBooked: boolean;
            dateId: string;
            bookingId: string | null;
            formId: string | null;
        };
    }>;
    deleteSlot(id: string, req: any): Promise<{
        message: string;
        data: {
            id: string;
            availabe: boolean;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            isBooked: boolean;
            dateId: string;
            bookingId: string | null;
            formId: string | null;
        };
    }>;
    updateSlotTimeByDate(id: string): Promise<{
        message: string;
        data: {
            id: string;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            doulaId: string;
            createdAt: Date;
            updatedAt: Date;
            isBooked: boolean;
        };
    }>;
}
