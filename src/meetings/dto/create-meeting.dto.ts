// create-meeting.dto.ts
import { IsUUID, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateMeetingDto {
  @IsUUID()
  @IsOptional()
  clientProfileId: string;

  @IsUUID()
  enquiryId: string;

  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsString()
  startTime: string; // HH:mm

  @IsString()
  endTime: string; // HH:mm

  @IsString()
  serviceName: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
