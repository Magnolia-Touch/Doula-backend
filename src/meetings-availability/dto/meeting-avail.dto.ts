import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailableSlotsForMeetingDto {
    @ApiProperty({ example: '2025-11-21', description: 'Date for the availability (YYYY-MM-DD)' })
    @IsString()
    date: string;

    @ApiProperty({ example: '09:00', description: 'Start time (HH:mm)' })
    @IsString()
    startTime: string;

    @ApiProperty({ example: '11:00', description: 'End time (HH:mm)' })
    @IsString()
    endTime: string;
}

export class UpdateSlotsForMeetingTimeDto {
    @ApiProperty({ example: 'time-slot-uuid', description: 'Time slot id (entry) that you want to update' })
    @IsString()
    timeSlotId: string;

    @ApiProperty({ example: '09:00' })
    @IsString()
    startTime: string;

    @ApiProperty({ example: '11:00' })
    @IsString()
    endTime: string;
}
