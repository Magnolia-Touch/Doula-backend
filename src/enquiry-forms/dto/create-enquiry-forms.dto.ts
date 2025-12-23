import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnquiryFormDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'region-uuid' })
  @IsString()
  regionId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  meetingsDate: string;

  @ApiProperty({
    example: '09:00-11:00',
    description: 'Time slot for the service',
  })
  @IsString()
  meetingsTimeSlots: string;

  @ApiProperty({ example: 'service-uuid' })
  @IsString()
  serviceId: string;

  //Below Are Required Service
  @ApiProperty({
    example: '2025-12-05',
    description: 'Service Start Date (ISO format)',
  })
  @IsDateString()
  @IsOptional()
  seviceStartDate: string;

  @ApiProperty({
    example: '2025-12-10',
    description: 'Service End Date (ISO format)',
  })
  @IsDateString()
  @IsOptional()
  serviceEndDate: string;

  //set defalut 0.
  @ApiProperty({
    example: 2,
    description: 'Visit Frequency for Services (e.g., twice a week)',
  })
  @IsOptional()
  @IsInt()
  @IsOptional()
  visitFrequency: number = 1;

  @ApiProperty({
    example: '09:00-11:00',
    description: 'Time slot for the service',
  })
  @IsString()
  @IsOptional()
  serviceTimeSlots: string;

  @ApiProperty({ required: false, description: 'Optional additional notes' })
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
