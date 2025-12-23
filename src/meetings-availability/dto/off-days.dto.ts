import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class MarkOffDaysDto {
    @ApiProperty({ example: '09:00', description: 'Start time (HH:mm)' })
    @IsString()
    date: string;

    @ApiProperty({ example: '09:00', description: 'Start time (HH:mm)' })
    @IsString()
    @IsOptional()
    startTime: string;

    @ApiProperty({ example: '11:00', description: 'End time (HH:mm)' })
    @IsString()
    @IsOptional()
    endTime: string;
}
