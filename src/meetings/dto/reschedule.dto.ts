import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RescheduleDto {
    @ApiProperty({ example: 'uuid-slot-id' })
    @IsString()
    newSlotId: string;

    @ApiProperty({ example: 'uuid-meeting-id' })
    @IsString()
    meetingId: string;
}
