import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RescheduleDto {
    @ApiProperty({ example: '2025-10-12' })
    @IsString()
    meetingsDate: string;

    @ApiProperty({ example: '09:00-11:00', description: 'Time slot for the service' })
    @IsString()
    meetingsTimeSlots: string;

    @ApiProperty({ example: 'uuid-meeting-id' })
    @IsString()
    meetingId: string;
}
