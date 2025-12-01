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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            weekday: string;
            availabe: boolean;
            doulaId: string;
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
                createdAt: Date;
                updatedAt: Date;
                availabe: boolean;
                startTime: Date;
                endTime: Date;
                dateId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            weekday: string;
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
            dateId: string;
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
            dateId: string;
        };
    }>;
    updateSlotTimeByDate(id: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            weekday: string;
            availabe: boolean;
            doulaId: string;
            isBooked: boolean;
        };
    }>;
}
