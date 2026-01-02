

import { IsArray, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

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
