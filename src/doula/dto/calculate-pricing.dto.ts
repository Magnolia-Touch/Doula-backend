import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimeShift } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CalculatePricingDto {
  @ApiProperty({
    description: 'Doula Profile ID',
    example: '7de77403-ca72-452b-abfa-296c26df8116',
  })
  @IsString()
  @IsNotEmpty()
  doulaProfileId: string;

  @ApiProperty({
    description: 'Service Pricing ID',
    example: '00880c8d-abbc-42df-b6d7-c24ab4044ed0',
  })
  @IsString()
  @IsNotEmpty()
  servicePricingId: string;

  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  serviceStartDate: string;

  @ApiProperty({
    description: 'End date (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  servicEndDate: string;

  //set defalut 0.
  @ApiProperty({
    example: 2,
    description: 'Visit Frequency for Services (e.g., twice a week)',
  })
  @IsOptional()
  @IsInt()
  visitFrequency: number = 1;

  @ApiProperty({
    example: TimeShift.MORNING,
    enum: TimeShift,
    description: 'Time shift for the service',
  })
  @IsEnum(TimeShift, {
    message: 'serviceTimeShift must be MORNING, NIGHT, or FULLDAY',
  })
  serviceTimeShift: TimeShift;


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
