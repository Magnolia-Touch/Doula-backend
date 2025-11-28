import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDoulaServiceAvailability {
    @ApiProperty({ example: '2025-11-21' })
    @IsString()
    date: string;

    @ApiProperty({ example: '09:00' })
    @IsString()
    startTime: string;

    @ApiProperty({ example: '11:00' })
    @IsString()
    endTime: string;
}

export class UpdateDoulaServiceAvailabilityDTO {
    @ApiProperty({ example: '09:00' })
    @IsString()
    startTime: string;

    @ApiProperty({ example: '11:00' })
    @IsString()
    endTime: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    availabe?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isBooked?: boolean;
}
