import { HttpStatus } from '@nestjs/common';
import { AvailableSlotsService } from './meetings-availability.service';
import { AvailableSlotsForMeetingDto, UpdateSlotsForMeetingTimeDto } from './dto/meeting-avail.dto';
export declare class AvailableSlotsController {
    private readonly service;
    constructor(service: AvailableSlotsService);
    createSlots(dto: AvailableSlotsForMeetingDto, req: any): Promise<{
        message: string;
        data: {
            weekday: import("@prisma/client").$Enums.WeekDays;
            ownerRole: any;
            timeslot: {
                startTime: Date;
                endTime: Date;
                available: boolean;
                is_booked: boolean;
            };
        };
    }>;
    getAllSlots(regionId: string, startDate: string, endDate: string, filter?: 'all' | 'booked' | 'unbooked', page?: string, limit?: string): Promise<{
        data: {
            dateId: string;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            ownerRole: import("@prisma/client").$Enums.Role;
            adminId: string | null;
            doulaId: string | null;
            zoneManagerId: string | null;
            createdAt: Date;
            updatedAt: Date;
            timings: any;
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
    getSlotById(id: string): Promise<{
        message: string;
        slot: {
            AvailableSlotsTimeForMeeting: {
                id: string;
                availabe: boolean;
                createdAt: Date;
                updatedAt: Date;
                startTime: Date;
                endTime: Date;
                isBooked: boolean;
                dateId: string;
                meetingsId: string | null;
            }[];
        } & {
            id: string;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            ownerRole: import("@prisma/client").$Enums.Role;
            doulaId: string | null;
            adminId: string | null;
            zoneManagerId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateSlot(dto: UpdateSlotsForMeetingTimeDto, req: any): Promise<{
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
            meetingsId: string | null;
        };
    }>;
    deleteSlot(slotId: string, req: any): Promise<{
        message: string;
        status: HttpStatus;
    } | {
        message: string;
        status?: undefined;
    }>;
    updateSlotAvail(id: string, booked: boolean, availabe: boolean): Promise<{
        message: string;
    }>;
    findall(req: any): Promise<({
        AvailableSlotsTimeForMeeting: {
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
        ownerRole: import("@prisma/client").$Enums.Role;
        doulaId: string | null;
        adminId: string | null;
        zoneManagerId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
