import { WeekDays } from "@prisma/client";
import { IsOptional, IsString } from "class-validator";

export class GetAvailabilityDto {
    @IsString()
    date1: string;

    @IsString()
    @IsOptional()
    date2: string;

    @IsString()
    @IsOptional()
    weekday: WeekDays;
}