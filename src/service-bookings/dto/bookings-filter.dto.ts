import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { BookingStatus, TimeShift } from '@prisma/client';

export class BookingFilterDto {

    @IsOptional()
    @IsString()
    regionId?: string;

    @IsOptional()
    @IsString()
    doulaId?: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsEnum(TimeShift)
    serviceTimeShift?: TimeShift;

    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @IsOptional()
    @IsBoolean()
    isPaid?: boolean;

    @IsOptional()
    @IsString()
    clientId?: string;

    @IsOptional()
    @IsString()
    serviceId?: string;
}
