import { DoulaServiceAvailabilityService } from './service-availability.service';
import { CreateDoulaServiceAvailabilityDto, UpdateDoulaServiceAvailabilityDto } from './dto/service-availability.dto';
import { CreateDoulaOffDaysDto, UpdateDoulaOffDaysDto } from './dto/off-days.dto';
export declare class DoulaServiceAvailabilityController {
    private readonly service;
    constructor(service: DoulaServiceAvailabilityService);
    createAvailability(dto: CreateDoulaServiceAvailabilityDto, req: any): Promise<{
        message: string;
        data: {
            from: Date;
            to: Date;
            totalDays: number;
        };
    }>;
    findAll(req: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            availability: import("@prisma/client/runtime/library").JsonValue;
            doulaId: string;
        }[];
    }>;
    findOne(id: string, req: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            availability: import("@prisma/client/runtime/library").JsonValue;
            doulaId: string;
        };
    }>;
    update(id: string, req: any, dto: UpdateDoulaServiceAvailabilityDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            availability: import("@prisma/client/runtime/library").JsonValue;
            doulaId: string;
        };
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    createOffDays(dto: CreateDoulaOffDaysDto, req: any): Promise<{
        message: string;
        data: {
            totalCreated: number;
            from: Date;
            to: Date;
            offtime: import("./dto/off-days.dto").OffTimeDto;
        };
    }>;
    getOffDays(req: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            offtime: import("@prisma/client/runtime/library").JsonValue;
            doulaProfileId: string;
        }[];
    }>;
    getOffdaysbyId(id: string, req: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            offtime: import("@prisma/client/runtime/library").JsonValue;
            doulaProfileId: string;
        };
    }>;
    updateOffdays(id: string, dto: UpdateDoulaOffDaysDto, req: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            offtime: import("@prisma/client/runtime/library").JsonValue;
            doulaProfileId: string;
        };
    }>;
    removeOffdays(id: string, req: any): Promise<{
        message: string;
    }>;
}
