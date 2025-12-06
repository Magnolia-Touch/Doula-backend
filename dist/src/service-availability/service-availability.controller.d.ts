import { DoulaServiceAvailabilityService } from './service-availability.service';
import { CreateDoulaServiceAvailability, UpdateDoulaServiceAvailabilityDTO } from './dto/service-availability.dto';
export declare class DoulaServiceAvailabilityController {
    private readonly service;
    constructor(service: DoulaServiceAvailabilityService);
    createSlots(dto: CreateDoulaServiceAvailability, req: any): Promise<{
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
    getAllSlots(doulaId: string, startDate: string, endDate: string, filter?: 'all' | 'booked' | 'unbooked', page?: string, limit?: string): Promise<{
        data: {
            id: string;
            date: Date;
            weekday: string;
            availabe: boolean;
            isBooked: boolean;
            createdAt: Date;
            updatedAt: Date;
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
                id: string;
                availabe: boolean;
                isBooked: boolean;
                createdAt: Date;
                updatedAt: Date;
                startTime: Date;
                endTime: Date;
                formId: string | null;
                bookingId: string | null;
                dateId: string;
            }[];
        } & {
            id: string;
            date: Date;
            weekday: string;
            availabe: boolean;
            isBooked: boolean;
            createdAt: Date;
            updatedAt: Date;
            doulaId: string;
        };
    }>;
    updateSlot(dto: UpdateDoulaServiceAvailabilityDTO, id: string, req: any): Promise<{
        message: string;
        data: {
            id: string;
            availabe: boolean;
            isBooked: boolean;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            formId: string | null;
            bookingId: string | null;
            dateId: string;
        };
    }>;
    deleteSlot(id: string, req: any): Promise<{
        message: string;
        data: {
            id: string;
            availabe: boolean;
            isBooked: boolean;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date;
            formId: string | null;
            bookingId: string | null;
            dateId: string;
        };
    }>;
    updateSlotTimeByDate(id: string): Promise<{
        message: string;
        data: {
            id: string;
            date: Date;
            weekday: string;
            availabe: boolean;
            isBooked: boolean;
            createdAt: Date;
            updatedAt: Date;
            doulaId: string;
        };
    }>;
}
