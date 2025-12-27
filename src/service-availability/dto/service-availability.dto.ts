import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WeekDays } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsEnum, ValidateNested, IsDateString } from 'class-validator';

export class ServiceAvailabilityDto {
  @IsBoolean()
  MORNING: boolean;

  @IsBoolean()
  NIGHT: boolean;

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
