import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsBoolean,
    IsInt,
    IsString,
    IsUUID,
    Min,
    IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetDoulasQueryDto {
    /* ---------------- Pagination ---------------- */

    @ApiPropertyOptional({
        example: 1,
        description: 'Page number (min 1)',
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 10,
        description: 'Number of records per page (min 1)',
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    /* ---------------- Search ---------------- */

    /**
     * Search across:
     * - User.name
     * - User.email
     * - User.phone
     */
    @ApiPropertyOptional({
        example: 'Neeta',
        description: 'Search by name, email, or phone',
    })
    @IsOptional()
    @IsString()
    search?: string;

    /* ---------------- Service filters ---------------- */

    @ApiPropertyOptional({
        example: 'Postnatal Care',
        description: 'Filter by service name',
    })
    @IsOptional()
    @IsString()
    serviceName?: string;

    @ApiPropertyOptional({
        example: 'service-uuid',
        description: 'Filter by service ID',
    })
    @IsOptional()
    @IsUUID()
    serviceId?: string;

    /* ---------------- Availability ---------------- */

    /**
     * true → only available doulas
     * false → ignored
     */
    @ApiPropertyOptional({
        example: true,
        description: 'Filter only available doulas',
    })
    @IsOptional()
    @Transform(({ value }) =>
        value === 'true' || value === true
            ? true
            : value === 'false' || value === false
                ? false
                : undefined,
    )
    @IsBoolean()
    isAvailable?: boolean;

    @ApiPropertyOptional({
        example: '2025-01-01',
        description: 'Availability start date (YYYY-MM-DD)',
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        example: '2025-01-31',
        description: 'Availability end date (YYYY-MM-DD)',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    /* ---------------- Experience & Status ---------------- */

    @ApiPropertyOptional({
        example: 3,
        description: 'Minimum years of experience',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minExperience?: number;

    @ApiPropertyOptional({
        example: true,
        description: 'Filter by active/inactive doulas',
    })
    @IsOptional()
    @Transform(({ value }) =>
        value === 'true' || value === true
            ? true
            : value === 'false' || value === false
                ? false
                : undefined,
    )
    @IsBoolean()
    isActive?: boolean;

    /* ---------------- Region ---------------- */

    @ApiPropertyOptional({
        example: 'region-uuid',
        description: 'Filter by region ID',
    })
    @IsOptional()
    @IsUUID()
    regionId?: string;
}
