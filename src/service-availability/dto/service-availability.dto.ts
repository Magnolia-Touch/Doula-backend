import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WeekDays } from '@prisma/client';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateDoulaServiceAvailability {
  @ApiProperty({
    enum: WeekDays,
    example: WeekDays.MONDAY,
    description: 'Day of the week',
  })
  @IsEnum(WeekDays, {
    message:
      'weekday must be one of MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY',
  })
  weekday: WeekDays;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  endTime: string;
}

export class UpdateDoulaServiceAvailabilityDTO {
  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  availabe?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isBooked?: boolean;
}
