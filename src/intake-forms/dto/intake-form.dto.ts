import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimeShift, WeekDays } from '@prisma/client';

export class IntakeFormDto {
  @ApiProperty({
    required: false,
    description: 'Name of the person (optional)',
    example: 'Jane Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    description: 'Email of the person (optional)',
    example: 'jane@example.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    required: false,
    description: 'Phone number (optional)',
    example: '+919876543210',
  })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'doula-uuid', description: 'Doula profile id' })
  @IsString()
  doulaProfileId: string;

  @ApiProperty({
    example: 'service-uuid',
    description: 'Service pricing id or service id',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({
    example: 'Street, City, State',
    description: 'Address for the service',
  })
  @IsString()
  address: string;

  @ApiProperty({ example: 2, description: 'Buffer time in minutes' })
  @IsNumber()
  buffer: number = 1;

  //Below Are Required Service
  @ApiProperty({
    example: '2025-12-05',
    description: 'Service Start Date (ISO format)',
  })
  @IsString()
  serviceStartDate: string;

  @ApiProperty({
    example: '2025-12-10',
    description: 'Service End Date (ISO format)',
  })
  @IsOptional()
  @IsString()
  serviceEndDate: string;

  @ApiPropertyOptional({
    example: ['SUNDAY', 'MONDAY', 'WEDNESDAY'],
    description: 'Weekdays when the service should occur',
    enum: WeekDays,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(WeekDays, { each: true })
  visitDays?: WeekDays[];


  @ApiProperty({
    example: TimeShift.MORNING,
    enum: TimeShift,
    description: 'Time shift for the service',
  })
  @IsEnum(TimeShift, {
    message: 'serviceTimeShift must be MORNING, NIGHT, or FULLDAY',
  })
  serviceTimeShift: TimeShift;
}



export class BookDoulaDto {
  @ApiProperty({
    required: false,
    description: 'Name of the person (optional)',
    example: 'Jane Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    description: 'Email of the person (optional)',
    example: 'jane@example.com',
  })
  @IsString()
  email?: string;

  @ApiProperty({
    required: false,
    description: 'Phone number (optional)',
    example: '+919876543210',
  })
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'Street, City, State',
    description: 'Address for the service',
  })
  @IsString()
  location: string;

  @ApiProperty({
    example: 'Street, City, State',
    description: 'Address for the service',
  })
  @IsString()
  address: string;

  @ApiProperty({ example: 'doula-uuid', description: 'Doula profile id' })
  @IsString()
  doulaProfileId: string;

  @ApiProperty({
    example: 'service-uuid',
    description: 'Service pricing id or service id',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({
    example: '2025-12-05',
    description: 'Service Start Date (ISO format)',
  })
  @IsString()
  serviceStartDate: string;


  @ApiProperty({
    example: '2025-12-10',
    description: 'Service End Date (ISO format)',
  })
  @IsString()
  @IsOptional()
  servicEndDate: string;


  @ApiPropertyOptional({
    example: ['SUNDAY', 'MONDAY', 'WEDNESDAY'],
    description: 'Weekdays when the service should occur',
    enum: WeekDays,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(WeekDays, { each: true })
  visitDays?: WeekDays[];


  @ApiProperty({
    example: TimeShift.MORNING,
    enum: TimeShift,
    description: 'Time shift for the service',
  })
  @IsEnum(TimeShift, {
    message: 'serviceTimeShift must be MORNING, NIGHT, or FULLDAY',
  })
  serviceTimeShift: TimeShift;


  @ApiProperty({ example: 60, description: 'Buffer time in minutes' })
  @IsNumber()
  buffer: number = 1;


  @IsOptional()
  @IsString()
  successUrl: string;

  @IsOptional()
  @IsString()
  cancelUrl: string;
}
