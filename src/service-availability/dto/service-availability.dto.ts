import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WeekDays } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  ValidateNested,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class ServiceAvailabilityDto {
  @ApiProperty({
    example: true,
    description: 'Morning shift availability',
  })
  @IsBoolean()
  MORNING: boolean;

  @ApiProperty({
    example: false,
    description: 'Night shift availability',
  })
  @IsBoolean()
  NIGHT: boolean;

  @ApiProperty({
    example: false,
    description: 'Full-day shift availability',
  })
  @IsBoolean()
  FULLDAY: boolean;
}

export class CreateDoulaServiceAvailabilityDto {
  @ApiProperty({
    example: '2025-10-30',
    description: 'Start date (required)',
  })
  @IsDateString()
  date1: string;

  @ApiPropertyOptional({
    example: '2025-11-02',
    description: 'End date (optional)',
  })
  @IsOptional()
  @IsDateString()
  date2?: string;

  @ApiProperty({
    type: ServiceAvailabilityDto,
    description: 'Availability configuration for shifts',
  })
  @ValidateNested()
  @Type(() => ServiceAvailabilityDto)
  availability: ServiceAvailabilityDto;
}

export class UpdateDoulaServiceAvailabilityDto {
  @ApiPropertyOptional({
    description: 'Partial update of service availability',
    example: {
      MORNING: false,
      NIGHT: true,
      FULLDAY: false,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceAvailabilityDto)
  availability?: Partial<ServiceAvailabilityDto>;
}

export class AvailableDoulasFilterDto {
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-01-31',
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: '7de77403-ca72-452b-abfa-296c26df8116',
    description: 'Region ID filter',
  })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({
    example: '00880c8d-abbc-42df-b6d7-c24ab4044ed0',
    description: 'Service ID filter',
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({
    example: 'MORNING',
    description: 'Shift filter (e.g., MORNING, NIGHT, FULLDAY)',
  })
  @IsOptional()
  @IsString()
  shift?: string;
}
