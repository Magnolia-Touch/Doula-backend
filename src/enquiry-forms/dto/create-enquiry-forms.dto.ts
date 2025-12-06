import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnquiryFormDto {
    @ApiProperty({ example: 'region-uuid' })
    @IsString()
    regionId: string;

    @ApiProperty({ example: 'slot-uuid' })
    @IsString()
    timeId: string;

    @ApiProperty({ example: 'service-uuid' })
    @IsString()
    serviceId: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsString()
    email: string;

    @ApiProperty({ example: '+919876543210' })
    @IsString()
    phone: string;

    @ApiProperty({ required: false, description: 'Optional additional notes' })
    @IsOptional()
    @IsString()
    additionalNotes?: string;

    @ApiProperty({ example: '2025-12-05', description: 'Service Start Date (ISO format)' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2025-12-10', description: 'Service End Date (ISO format)' })
    @IsDateString()
    endDate: string;

    //set defalut 0.
    @ApiProperty({ example: 2, description: 'Visit Frequency for Services (e.g., twice a week)' })
    @IsOptional()
    @IsInt()
    visitFrequency: number = 1;

    @ApiProperty({ example: '09:00-11:00', description: 'Time slot for the service' })
    @IsString()
    timeSlots: string;
}
