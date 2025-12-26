import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaServiceAvailability } from './dto/service-availability.dto';
import { UpdateDoulaServiceAvailabilityDTO } from './dto/service-availability.dto';
export declare class DoulaServiceAvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    createAvailability(dto: CreateDoulaServiceAvailability, user: any): Promise<{
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
    getMyAvailabilities(userId: string): Promise<({
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
    getAllSlots(doulaId: string, startDate: string, endDate: string, filter?: 'all' | 'booked' | 'unbooked', page?: number, limit?: number): Promise<{
        data: {
            id: string;
            weekday: import("@prisma/client").$Enums.WeekDays;
            availabe: boolean;
            doulaId: string;
            createdAt: Date;
            updatedAt: Date;
            isBooked: boolean;
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
    updateSlotTimeById(dto: UpdateDoulaServiceAvailabilityDTO, timeSlotId: string, userId: string): Promise<{
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
    deleteSlots(timeSlotId: string, userId: string): Promise<{
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
    updateSlotTimeByDate(timeSlotId: string): Promise<{
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
