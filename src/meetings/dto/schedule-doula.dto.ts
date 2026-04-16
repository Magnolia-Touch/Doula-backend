import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeetingStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ScheduleDoulaDto {
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'Enquiry ID',
  })
  @IsUUID()
  enquiryId!: string;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Scheduled date (YYYY-MM-DD)',
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    example: '10:30:00',
    description: 'Scheduled time (HH:mm:ss)',
  })
  @IsString()
  time!: string; // HH:mm:ss

  @ApiPropertyOptional({
    example: 'Client prefers morning session',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'Postnatal Care',
    description: 'Service name',
  })
  @IsOptional()
  @IsString()
  serviceName?: string;

  @ApiProperty({
    type: [String],
    example: [
      '7de77403-ca72-452b-abfa-296c26df8116',
      '8ae77403-ca72-452b-abfa-296c26df8222',
    ],
    description: 'List of doula IDs to be scheduled',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  doulaIds!: string[];

  @ApiPropertyOptional({
    example: 12,
    description: 'Optional commission percentage override for client profile',
  })
  @IsOptional()
  @IsNumber()
  commissionPercentage?: number;
}

export class UpdateClientDoulaEnquiryDto {
  @ApiPropertyOptional({
    example: '2025-01-20',
    description: 'Updated date (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  date!: string;

  @ApiPropertyOptional({
    example: '14:00:00',
    description: 'Updated time (HH:mm:ss)',
  })
  @IsString()
  @IsOptional()
  time!: string; // HH:mm:ss

  @ApiPropertyOptional({
    example: 'Rescheduled due to client request',
    description: 'Updated notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: '7de77403-ca72-452b-abfa-296c26df8116',
    description: 'Assigned doula ID',
  })
  @IsUUID()
  doulaId!: string;
}

export class UpdateMeetingStatusDto {
  @ApiProperty({
    enum: MeetingStatus,
    example: MeetingStatus.SCHEDULED,
    description: 'Meeting status',
  })
  @IsEnum(MeetingStatus)
  status!: MeetingStatus;
}
