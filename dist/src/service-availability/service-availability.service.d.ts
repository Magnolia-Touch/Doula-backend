import { PrismaService } from "src/prisma/prisma.service";
import { CreateDoulaServiceAvailability } from "./dto/service-availability.dto";
import { UpdateDoulaServiceAvailabilityDTO } from "./dto/service-availability.dto";
export declare class DoulaServiceAvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    createAvailability(dto: CreateDoulaServiceAvailability, user: any): Promise<{
        message: string;
        data: {
            date: Date;
            ownerRole: any;
            timeslot: {
                startTime: Date;
                endTime: Date;
                available: boolean;
            };
        };
    }>;
    getAllSlots(doulaId: string, startDate: string, endDate: string, filter?: 'all' | 'booked' | 'unbooked', page?: number, limit?: number): Promise<{
        data: {
            date: Date;
            availabe: boolean;
            isBooked: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weekday: string;
            doulaId: string;
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
                startTime: Date;
                endTime: Date;
                availabe: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                dateId: string;
            }[];
        } & {
            date: Date;
            availabe: boolean;
            isBooked: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weekday: string;
            doulaId: string;
        };
    }>;
    updateSlotTimeById(dto: UpdateDoulaServiceAvailabilityDTO, timeSlotId: string, userId: string): Promise<{
        message: string;
        data: {
            startTime: Date;
            endTime: Date;
            availabe: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dateId: string;
        };
    }>;
    deleteSlots(timeSlotId: string, userId: string): Promise<{
        message: string;
        data: {
            startTime: Date;
            endTime: Date;
            availabe: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dateId: string;
        };
    }>;
    updateSlotTimeByDate(timeSlotId: string): Promise<{
        message: string;
        data: {
            date: Date;
            availabe: boolean;
            isBooked: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weekday: string;
            doulaId: string;
        };
    }>;
}
