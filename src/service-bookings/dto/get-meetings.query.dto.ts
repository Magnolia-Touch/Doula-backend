// dto/get-meetings.query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { MeetingStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetMeetingsQueryDto {
  @ApiPropertyOptional({
    enum: MeetingStatus,
    example: MeetingStatus.SCHEDULED,
    description: 'Filter meetings by status',
  })
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filter meetings from this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  date1?: string; // YYYY-MM-DD

  @ApiPropertyOptional({
    example: '2025-01-31',
    description: 'Filter meetings up to this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  date2?: string; // YYYY-MM-DD

  @ApiPropertyOptional({
    example: 'service-uuid',
    description: 'Filter by service ID',
  })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({
    example: 'region-uuid',
    description: 'Filter by region ID',
  })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional({
    example: 'zone-manager-uuid',
    description: 'Filter by zone manager ID',
  })
  @IsOptional()
  @IsString()
  zoneManagerId?: string;

  @ApiPropertyOptional({
    example: 'meeting-uuid',
    description: 'Filter by meeting ID',
  })
  @IsOptional()
  @IsString()
  meetingId?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records per page',
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
