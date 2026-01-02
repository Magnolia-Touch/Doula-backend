import { PrismaService } from 'src/prisma/prisma.service';
import { AvailableDoulasFilterDto, CreateDoulaServiceAvailabilityDto, UpdateDoulaServiceAvailabilityDto } from './dto/service-availability.dto';
import { Prisma } from '@prisma/client';
import { CreateDoulaOffDaysDto, UpdateDoulaOffDaysDto } from './dto/off-days.dto';
type AvailableDoulaResult = {
    doulaName: string;
    shift: string[];
    noOfUnavailableDaysInThatPeriod: number;
    availableServices: string[];
};
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
            date: Date;
            availability: Prisma.JsonValue;
            doulaId: string;
        }[];
    }>;
    findOne(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            availability: Prisma.JsonValue;
            doulaId: string;
        };
    }>;
    update(id: string, dto: UpdateDoulaServiceAvailabilityDto, user: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            availability: Prisma.JsonValue;
            doulaId: string;
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
            offtime: Prisma.JsonValue;
            doulaProfileId: string;
        }[];
    }>;
    getOffdaysbyId(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            offtime: Prisma.JsonValue;
            doulaProfileId: string;
        };
    }>;
    updateOffdays(id: string, dto: UpdateDoulaOffDaysDto, user: any): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            offtime: Prisma.JsonValue;
            doulaProfileId: string;
        };
    }>;
    removeOffdays(id: string, user: any): Promise<{
        message: string;
    }>;
    getAvailableDoulas(filters: AvailableDoulasFilterDto): Promise<{
        status: string;
        data: AvailableDoulaResult[];
    }>;
}
export {};
