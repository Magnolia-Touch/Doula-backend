import { HttpStatus } from '@nestjs/common';
import { AvailableSlotsService } from './meetings-availability.service';
import { AvailableSlotsForMeetingDto, UpdateSlotsForMeetingTimeDto } from './dto/meeting-avail.dto';
export declare class AvailableSlotsController {
    private readonly service;
    constructor(service: AvailableSlotsService);
    createSlots(dto: AvailableSlotsForMeetingDto[], req: any): Promise<{
        message: string;
        data: {
            date: Date;
            ownerRole: any;
            timeslot: {
                startTime: Date;
                endTime: Date;
                available: boolean;
                is_booked: boolean;
            };
        };
    }[]>;
    getAllSlots(regionId: string, startDate: string, endDate: string, filter?: 'all' | 'booked' | 'unbooked', page?: string, limit?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            zoneManagerId: string | null;
            date: Date;
            weekday: string;
            availabe: boolean;
            ownerRole: import("@prisma/client").$Enums.Role;
            doulaId: string | null;
            adminId: string | null;
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
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            zoneManagerId: string | null;
            date: Date;
            weekday: string;
            availabe: boolean;
            ownerRole: import("@prisma/client").$Enums.Role;
            doulaId: string | null;
            adminId: string | null;
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
}
