import { IsArray, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClientDoulaEnquiryDto {
    @IsUUID()
    clientId: string;

    @IsDateString()
    date: string;

    @IsString()
    time: string; // HH:mm:ss

    @IsOptional()
    @IsString()
    notes?: string;

    @IsArray()
    @IsUUID('all', { each: true })
    doulaIds: string[];
}
