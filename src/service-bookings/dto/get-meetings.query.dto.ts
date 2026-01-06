// dto/get-meetings.query.dto.ts
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { MeetingStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetMeetingsQueryDto {
    @IsOptional()
    @IsEnum(MeetingStatus)
    status?: MeetingStatus;

    @IsOptional()
    @IsDateString()
    date1?: string; // YYYY-MM-DD

    @IsOptional()
    @IsDateString()
    date2?: string; // YYYY-MM-DD

    @IsOptional()
    @IsString()
    serviceName?: string;

    @IsOptional()
    @IsString()
    regionId?: string;

    @IsOptional()
    @IsString()
    zoneManagerId?: string;

    @IsOptional()
    @IsString()
    meetingId?: string;

    @IsOptional()
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    limit?: number;

}
