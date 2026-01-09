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

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

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
    @IsOptional()
    @IsString()
    search?: string;

    /* ---------------- Service filters ---------------- */

    @IsOptional()
    @IsString()
    serviceName?: string;

    @IsOptional()
    @IsUUID()
    serviceId?: string;

    /* ---------------- Availability ---------------- */

    /**
     * true → only available doulas
     * false → ignored
     */
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

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    /* ---------------- Experience & Status ---------------- */

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minExperience?: number;

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

    @IsOptional()
    @IsUUID()
    regionId?: string;
}
