// src/modules/schedules/dto/get-schedules.query.dto.ts
import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceStatus, TimeShift } from '@prisma/client';

export class GetSchedulesQueryDto {
    @IsOptional()
    @IsDateString()
    date1?: string;

    @IsOptional()
    @IsDateString()
    date2?: string;

    @IsOptional()
    @IsEnum(TimeShift)
    timeshift?: TimeShift;

    @IsOptional()
    @IsEnum(ServiceStatus)
    status?: ServiceStatus;

    @IsOptional()
    @IsString()
    doulaId?: string;

    @IsOptional()
    @IsString()
    regionId?: string;

    @IsOptional()
    @IsString()
    serviceId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}
