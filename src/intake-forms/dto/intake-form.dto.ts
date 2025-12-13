import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IntakeFormDto {
    @ApiProperty({ required: false, description: 'Name of the person (optional)', example: 'Jane Doe' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false, description: 'Email of the person (optional)', example: 'jane@example.com' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({ required: false, description: 'Phone number (optional)', example: '+919876543210' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'doula-uuid', description: 'Doula profile id' })
    @IsString()
    doulaProfileId: string;

    @ApiProperty({ example: 'service-uuid', description: 'Service pricing id or service id' })
    @IsString()
    serviceId: string;

    @ApiProperty({ example: 'Street, City, State', description: 'Address for the service' })
    @IsString()
    address: string;

    @ApiProperty({ example: 60, description: 'Buffer time in minutes' })
    @IsNumber()
    buffer: number;

    @ApiProperty({ example: 'uuid-enquiry-id' })
    @IsString()
    enquiryId: string;
}


export class BookDoulaDto {
    @ApiProperty({ required: false, description: 'Name of the person (optional)', example: 'Jane Doe' })
    @IsString()
    name: string;

    @ApiProperty({ required: false, description: 'Email of the person (optional)', example: 'jane@example.com' })
    @IsString()
    email?: string;

    @ApiProperty({ required: false, description: 'Phone number (optional)', example: '+919876543210' })
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'Street, City, State', description: 'Address for the service' })
    @IsString()
    location: string;

    @ApiProperty({ example: 'Street, City, State', description: 'Address for the service' })
    @IsString()
    address: string;

    @ApiProperty({ example: 'doula-uuid', description: 'Doula profile id' })
    @IsString()
    doulaProfileId: string;

    @ApiProperty({ example: 'service-uuid', description: 'Service pricing id or service id' })
    @IsString()
    serviceId: string;

    @ApiProperty({ example: '2025-12-05', description: 'Service Start Date (ISO format)' })
    @IsString()
    serviceStartDate: string;

    @ApiProperty({ example: '2025-12-10', description: 'Service End Date (ISO format)' })
    @IsString()
    servicEndDate: string;

    //set defalut 0.
    @ApiProperty({ example: 2, description: 'Visit Frequency for Services (e.g., twice a week)' })
    @IsOptional()
    @IsInt()
    visitFrequency: number = 1;

    @ApiProperty({ example: '09:00-11:00', description: 'Time slot for the service' })
    @IsString()
    timeSlots: string;

    @ApiProperty({ example: 60, description: 'Buffer time in minutes' })
    @IsNumber()
    buffer: number;

}


