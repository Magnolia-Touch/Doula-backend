import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsOptional, ValidateNested } from "class-validator";

export class OffTimeDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    MORNING: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    NIGHT: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    FULLDAY: boolean;
}


export class CreateDoulaOffDaysDto {
    @ApiProperty({
        example: '1956-05-16',
        description: 'Start date (required)',
    })
    @IsDateString()
    date1: string;

    @ApiPropertyOptional({
        example: '1956-05-20',
        description: 'End date (optional)',
    })
    @IsOptional()
    @IsDateString()
    date2?: string;

    @ApiProperty({
        type: OffTimeDto,
        example: {
            MORNING: true,
            NIGHT: true,
            FULLDAY: true,
        },
    })
    @ValidateNested()
    @Type(() => OffTimeDto)
    offtime: OffTimeDto;
}

export class UpdateDoulaOffDaysDto {
    @ApiPropertyOptional({
        example: '1956-05-16',
        description: 'Update date (optional)',
    })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional({
        type: OffTimeDto,
        example: {
            morning: false,
            night: true,
            fullday: false,
        },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => OffTimeDto)
    offtime?: Partial<OffTimeDto>;
}
