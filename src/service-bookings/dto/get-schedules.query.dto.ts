// src/modules/schedules/dto/get-schedules.query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsEnum,
    IsDateString,
    IsInt,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceStatus, TimeShift } from '@prisma/client';

export class GetSchedulesQueryDto {
    @ApiPropertyOptional({
        example: '2025-01-01',
        description: 'Filter schedules from this date (YYYY-MM-DD)',
    })
    @IsOptional()
    @IsDateString()
    date1?: string;

    @ApiPropertyOptional({
        example: '2025-01-31',
        description: 'Filter schedules up to this date (YYYY-MM-DD)',
    })
    @IsOptional()
    @IsDateString()
    date2?: string;

    @ApiPropertyOptional({
        enum: TimeShift,
        example: TimeShift.MORNING,
        description: 'Filter by time shift',
    })
    @IsOptional()
    @IsEnum(TimeShift)
    timeshift?: TimeShift;

    @ApiPropertyOptional({
        enum: ServiceStatus,
        example: ServiceStatus.COMPLETED,
        description: 'Filter by service status',
    })
    @IsOptional()
    @IsEnum(ServiceStatus)
    status?: ServiceStatus;

    @ApiPropertyOptional({
        example: 'doula-uuid',
        description: 'Filter by doula ID',
    })
    @IsOptional()
    @IsString()
    doulaId?: string;

    @ApiPropertyOptional({
        example: 'region-uuid',
        description: 'Filter by region ID',
    })
    @IsOptional()
    @IsString()
    regionId?: string;

    @ApiPropertyOptional({
        example: 'service-uuid',
        description: 'Filter by service ID',
    })
    @IsOptional()
    @IsString()
    serviceId?: string;

    @ApiPropertyOptional({
        example: 1,
        description: 'Page number for pagination (min 1)',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        example: 10,
        description: 'Number of records per page (min 1)',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}
