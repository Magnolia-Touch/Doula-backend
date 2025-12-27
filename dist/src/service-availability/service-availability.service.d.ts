import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaServiceAvailabilityDto, UpdateDoulaServiceAvailabilityDto } from './dto/service-availability.dto';
import { Prisma } from '@prisma/client';
import { CreateDoulaOffDaysDto, UpdateDoulaOffDaysDto } from './dto/off-days.dto';
export declare class DoulaServiceAvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    private getDoulaProfile;
    createAvailability(dto: CreateDoulaServiceAvailabilityDto, user: any): Promise<{
        message: string;
        data: {
            from: Date;
            to: Date;
            totalDays: number;
        };
    }>;
    findAll(user: any, query?: {
        fromDate?: string;
        toDate?: string;
    }): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            doulaId: string;
            date: Date;
            availability: Prisma.JsonValue;
        }[];
    }>;
    findOne(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            doulaId: string;
            date: Date;
            availability: Prisma.JsonValue;
        };
    }>;
    update(id: string, dto: UpdateDoulaServiceAvailabilityDto, user: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            doulaId: string;
            date: Date;
            availability: Prisma.JsonValue;
        };
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
    createOffDays(dto: CreateDoulaOffDaysDto, user: any): Promise<{
        message: string;
        data: {
            totalCreated: number;
            from: Date;
            to: Date;
            offtime: import("./dto/off-days.dto").OffTimeDto;
        };
    }>;
    getOffDays(user: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            doulaProfileId: string;
            offtime: Prisma.JsonValue;
        }[];
    }>;
    getOffdaysbyId(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            doulaProfileId: string;
            offtime: Prisma.JsonValue;
        };
    }>;
    updateOffdays(id: string, dto: UpdateDoulaOffDaysDto, user: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            doulaProfileId: string;
            offtime: Prisma.JsonValue;
        };
    }>;
    removeOffdays(id: string, user: any): Promise<{
        message: string;
    }>;
}
