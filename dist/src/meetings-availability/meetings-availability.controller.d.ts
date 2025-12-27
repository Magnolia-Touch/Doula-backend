import { HttpStatus } from '@nestjs/common';
import { AvailableSlotsService } from './meetings-availability.service';
import { AvailableSlotsForMeetingDto, UpdateSlotsForMeetingTimeDto } from './dto/meeting-avail.dto';
import { MarkOffDaysDto } from './dto/off-days.dto';
import { GetAvailabilityDto } from './dto/get-availability.dto';
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
                createdAt: Date;
                updatedAt: Date;
                availabe: boolean;
                startTime: Date;
                endTime: Date;
                isBooked: boolean;
                dateId: string;
                meetingsId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerRole: import("@prisma/client").$Enums.Role;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            doulaId: string | null;
            adminId: string | null;
            zoneManagerId: string | null;
        };
    }>;
    updateSlot(dto: UpdateSlotsForMeetingTimeDto, req: any): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        ownerRole: import("@prisma/client").$Enums.Role;
        weekday: import("@prisma/client").$Enums.WeekDays;
        availabe: boolean;
        doulaId: string | null;
        adminId: string | null;
        zoneManagerId: string | null;
    })[]>;
    markOffDays(req: any, dto: MarkOffDaysDto): Promise<import("@prisma/client").Prisma.BatchPayload | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date | null;
        endTime: Date | null;
        date: Date;
        zoneManagerProfileId: string | null;
        doulaProfileId: string | null;
    }>;
    fetchOffDays(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date | null;
        endTime: Date | null;
        date: Date;
        zoneManagerProfileId: string | null;
        doulaProfileId: string | null;
    }[]>;
    fetchOffdaysbyid(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date | null;
        endTime: Date | null;
        date: Date;
        zoneManagerProfileId: string | null;
        doulaProfileId: string | null;
    } | null>;
    DeleteOffdaysbyid(req: any, id: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date | null;
            endTime: Date | null;
            date: Date;
            zoneManagerProfileId: string | null;
            doulaProfileId: string | null;
        };
    }>;
    ZmgetAvailablility(req: any, dto: GetAvailabilityDto): Promise<{
        date: Date;
        weekday: import("@prisma/client").$Enums.WeekDays;
        timeslots: {
            startTime: string;
            endTime: string;
        }[];
    }[]>;
}
