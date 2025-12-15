import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { MeetingStatus } from '@prisma/client';

export class ScheduleDoulaDto {
    @ApiProperty({ example: 'uuid-enquiry-id' })
    @IsString()
    enquiryId: string;

    @ApiProperty({ example: '2025-10-12' })
    @IsString()
    meetingsDate: string;

    @ApiProperty({ example: '09:00-11:00', description: 'Time slot for the service' })
    @IsString()
    meetingsTimeSlots: string;

    @ApiProperty({ example: 'uuid-slot-id' })
    @IsString()
    doulaId: string;

    @ApiProperty({ required: false, description: 'Optional additional notes' })
    @IsOptional()
    @IsString()
    additionalNotes?: string;


}
