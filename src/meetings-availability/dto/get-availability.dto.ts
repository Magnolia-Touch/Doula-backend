import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WeekDays } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class GetAvailabilityDto {
    @ApiProperty({
        example: '2025-01-10',
        description: 'Start date (YYYY-MM-DD)',
    })
    @IsString()
    date1: string;

    @ApiPropertyOptional({
        example: '2025-01-20',
        description: 'End date (YYYY-MM-DD)',
    })
    @IsString()
    @IsOptional()
    date2: string;

    @ApiPropertyOptional({
        enum: WeekDays,
        example: WeekDays.MONDAY,
        description: 'Weekday filter',
    })
    @IsString()
    @IsOptional()
    weekday: WeekDays;
}
