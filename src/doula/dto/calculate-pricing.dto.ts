import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimeShift, WeekDays } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ArrayNotEmpty,
  IsEmail,
} from 'class-validator';

export class CalculatePricingDto {

  @ApiProperty({
    description: 'Client Email',
    example: 'client@example.com',
  })
  @IsEmail()
  clientEmail?: string;


  @ApiProperty({
    description: 'Doula Profile ID',
    example: '7de77403-ca72-452b-abfa-296c26df8116',
  })
  @IsString()
  @IsNotEmpty()
  doulaProfileId!: string;

  @ApiProperty({
    description: 'Service Pricing ID',
    example: '00880c8d-abbc-42df-b6d7-c24ab4044ed0',
  })
  @IsString()
  @IsNotEmpty()
  servicePricingId!: string;

  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  serviceStartDate!: string;

  @ApiProperty({
    description: 'End date (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  servicEndDate!: string;

  @ApiPropertyOptional({
    example: ['SUNDAY', 'MONDAY', 'WEDNESDAY'],
    description: 'Weekdays when the service should occur',
    enum: WeekDays,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(WeekDays, { each: true })
  visitDays?: WeekDays[];

  @ApiProperty({
    example: TimeShift.MORNING,
    enum: TimeShift,
    description: 'Time shift for the service',
  })
  @IsEnum(TimeShift, {
    message: 'serviceTimeShift must be MORNING, NIGHT, or FULLDAY',
  })
  serviceTimeShift!: TimeShift;

  @ApiPropertyOptional({
    description: 'Service hours requested for the booking preview',
    example: 8,
    default: 8,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  serviceHour?: number;

  @ApiPropertyOptional({
    description: 'Optional commission percentage override',
    example: 12,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  commissionPercentage?: number;

  @ApiPropertyOptional({
    description: 'Buffer days before and after for Birth Doula service',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  buffer?: number;
}
