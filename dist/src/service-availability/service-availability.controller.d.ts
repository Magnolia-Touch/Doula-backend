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
        createdAt: Date;
        updatedAt: Date;
        weekday: import("@prisma/client").$Enums.WeekDays;
        availabe: boolean;
        doulaId: string;
        isBooked: boolean;
    })[]>;
    getSlotById(id: string): Promise<{
        message: string;
        slot: {
            AvailableSlotsTimeForService: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                availabe: boolean;
                startTime: Date;
                endTime: Date;
                isBooked: boolean;
                dateId: string;
                formId: string | null;
                bookingId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            doulaId: string;
            isBooked: boolean;
        };
    }>;
    updateSlot(dto: UpdateDoulaServiceAvailabilityDTO, id: string, req: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            availabe: boolean;
            startTime: Date;
            endTime: Date;
            isBooked: boolean;
            dateId: string;
            formId: string | null;
            bookingId: string | null;
        };
    }>;
    deleteSlot(id: string, req: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            availabe: boolean;
            startTime: Date;
            endTime: Date;
            isBooked: boolean;
            dateId: string;
            formId: string | null;
            bookingId: string | null;
        };
    }>;
    updateSlotTimeByDate(id: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            doulaId: string;
            isBooked: boolean;
        };
    }>;
}
