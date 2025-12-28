
// dto/update-schedule-status.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
    @IsEnum(BookingStatus)
    status: BookingStatus;

    @IsString()
    @IsOptional()
    notes: string;

    @IsString()
    @IsOptional()
    isPaid?: boolean;

    paymentDetails?: any;
}

