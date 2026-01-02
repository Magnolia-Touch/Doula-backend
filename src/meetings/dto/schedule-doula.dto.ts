import { ApiProperty } from '@nestjs/swagger';
import { MeetingStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ScheduleDoulaDto {
  @IsUUID()
  enquiryId: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string; // HH:mm:ss

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  doulaIds: string[];
}



export class UpdateClientDoulaEnquiryDto {
  @IsDateString()
  @IsOptional()
  date: string;

  @IsString()
  @IsOptional()
  time: string; // HH:mm:ss

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  doulaId: string;
}


export class UpdateMeetingStatusDto {
  @IsEnum(MeetingStatus)
  status: MeetingStatus;
}