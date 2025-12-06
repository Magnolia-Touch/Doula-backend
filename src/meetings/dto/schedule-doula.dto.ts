import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsString } from 'class-validator';
import { MeetingStatus } from '@prisma/client';

export class ScheduleDoulaDto {
    @ApiProperty({ example: 'uuid-enquiry-id' })
    @IsString()
    enquiryId: string;

    @ApiProperty({ example: 'uuid-slot-id' })
    @IsString()
    slotId: string;

    @ApiProperty({ example: 'uuid-slot-id' })
    @IsString()
    doulaId: string;



}
