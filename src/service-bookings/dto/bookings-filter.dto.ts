import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { BookingStatus, TimeShift } from '@prisma/client';

export class BookingFilterDto {
  @ApiPropertyOptional({
    example: '7de77403-ca72-452b-abfa-296c26df8116',
    description: 'Filter by region ID',
  })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional({
    example: 'doula-uuid',
    description: 'Filter by doula ID',
  })
  @IsOptional()
  @IsString()
  doulaId?: string;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filter bookings from this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-01-31',
    description: 'Filter bookings up to this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: TimeShift,
    example: TimeShift.MORNING,
    description: 'Filter by service time shift',
  })
  @IsOptional()
  @IsEnum(TimeShift)
  serviceTimeShift?: TimeShift;

  @ApiPropertyOptional({
    enum: BookingStatus,
    example: BookingStatus.PENDING,
    description: 'Filter by booking status',
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by payment status',
  })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({
    example: 'client-uuid',
    description: 'Filter by client ID',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    example: 'service-uuid',
    description: 'Filter by service ID',
  })
  @IsOptional()
  @IsString()
  serviceId?: string;
}
