import { HttpStatus } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AvailableSlotsForMeetingDto, UpdateSlotsForMeetingTimeDto } from "./dto/meeting-avail.dto";
export declare class AvailableSlotsService {
    private prisma;
    constructor(prisma: PrismaService);
    createAvailability(dto: AvailableSlotsForMeetingDto, user: any): Promise<{
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
    }>;
    getAllSlots(regionId: string, startDate: string, endDate: string, filter?: 'all' | 'booked' | 'unbooked', page?: number, limit?: number): Promise<{
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
    updateSlotTimeById(dto: UpdateSlotsForMeetingTimeDto, userId: string): Promise<{
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
}
