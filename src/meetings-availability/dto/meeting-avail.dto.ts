import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeekDays } from '@prisma/client';

export class AvailableSlotsForMeetingDto {
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

  @ApiProperty({ example: '09:00', description: 'Start time (HH:mm)' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:00', description: 'End time (HH:mm)' })
  @IsString()
  endTime: string;
}

export class UpdateSlotsForMeetingTimeDto {
  @ApiProperty({
    example: 'time-slot-uuid',
    description: 'Time slot id (entry) that you want to update',
  })
  @IsString()
  timeSlotId: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  endTime: string;
}
