import { DoulaServiceAvailabilityService } from './service-availability.service';
import { CreateDoulaServiceAvailability, UpdateDoulaServiceAvailabilityDTO } from './dto/service-availability.dto';
export declare class DoulaServiceAvailabilityController {
    private readonly service;
    constructor(service: DoulaServiceAvailabilityService);
    createSlots(dto: CreateDoulaServiceAvailability[], req: any): Promise<{
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
    }[]>;
    getAllSlots(doulaId: string, startDate: string, endDate: string, filter?: 'all' | 'booked' | 'unbooked', page?: string, limit?: string): Promise<{
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
    updateSlot(dto: UpdateDoulaServiceAvailabilityDTO, id: string, req: any): Promise<{
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
    deleteSlot(id: string, req: any): Promise<{
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
    updateSlotTimeByDate(id: string): Promise<{
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
