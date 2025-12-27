import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import { TimeShift } from '@prisma/client';

export enum ServiceType {
  POSTPARTUM = 'postpartum',
  BIRTH = 'birth',
}

export class CalculateServicePriceDto {
  @ApiProperty({
    description: 'Doula Profile ID',
    example: '7de77403-ca72-452b-abfa-296c26df8116',
  })
  @IsNotEmpty()
  @IsUUID()
  doulaProfileId: string;

  @ApiProperty({
    description: 'Service Pricing ID',
    example: '00880c8d-abbc-42df-b6d7-c24ab4044ed0',
  })
  @IsNotEmpty()
  @IsUUID()
  servicePricingId: string;

  @ApiProperty({
    description: 'Start date in ISO format (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date in ISO format (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Service type',
    enum: ServiceType,
    example: ServiceType.POSTPARTUM,
  })
  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiPropertyOptional({
    description:
      'Visit frequency in days (required for postpartum service)',
    example: 7,
    minimum: 1,
  })
  @ValidateIf((o) => o.serviceType === ServiceType.POSTPARTUM)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  visitFrequency?: number;

  @ApiPropertyOptional({
    description: 'Time shift (required for postpartum service)',
    enum: TimeShift,
    example: TimeShift.MORNING,
  })
  @ValidateIf((o) => o.serviceType === ServiceType.POSTPARTUM)
  @IsNotEmpty()
  @IsEnum(TimeShift)
  timeShift?: TimeShift;
}
