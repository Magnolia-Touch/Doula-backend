import { HttpStatus } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AvailableSlotsForMeetingDto, UpdateSlotsForMeetingTimeDto } from "./dto/meeting-avail.dto";
export declare class AvailableSlotsService {
    private prisma;
    constructor(prisma: PrismaService);
    createAvailability(dto: AvailableSlotsForMeetingDto, user: any): Promise<{
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
    getMyAvailabilities(userId: string): Promise<({
        AvailableSlotsTimeForMeeting: {
            id: string;
            startTime: Date;
            endTime: Date;
            availabe: boolean;
            isBooked: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        zoneManagerId: string | null;
        weekday: import("@prisma/client").$Enums.WeekDays;
        availabe: boolean;
        ownerRole: import("@prisma/client").$Enums.Role;
        doulaId: string | null;
        adminId: string | null;
    })[]>;
    getAllSlots(regionId: string, startDate: string, endDate: string, filter?: 'all' | 'booked' | 'unbooked', page?: number, limit?: number): Promise<{
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
                startTime: Date;
                endTime: Date;
                availabe: boolean;
                isBooked: boolean;
                dateId: string;
                meetingsId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            zoneManagerId: string | null;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            ownerRole: import("@prisma/client").$Enums.Role;
            doulaId: string | null;
            adminId: string | null;
        };
    }>;
    updateSlotTimeById(dto: UpdateSlotsForMeetingTimeDto, userId: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            availabe: boolean;
            isBooked: boolean;
            dateId: string;
            meetingsId: string | null;
        };
    }>;
    deleteSlots(slotId: string, userId: string): Promise<{
        message: string;
        status: HttpStatus;
    } | {
        message: string;
        status?: undefined;
    }>;
    updateTimeSlotAvailability(id: string, booked: boolean, availabe: boolean): Promise<{
        message: string;
    }>;
    findall(user: any, startDate: string, endDate: string, filter?: 'all' | 'booked' | 'unbooked', page?: number, limit?: number): Promise<{
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
}
