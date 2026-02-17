import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetTestimonialsDto {
  @ApiPropertyOptional({
    example: 'doula-uuid',
    description: 'Filter testimonials by doula ID',
  })
  @IsOptional()
  @IsString()
  doulaId?: string;

  @ApiPropertyOptional({
    example: 'service-uuid',
    description: 'Filter testimonials by service ID',
  })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({
    example: 'region-uuid',
    description: 'Filter testimonials by region ID',
  })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional({
    example: 5,
    minimum: 1,
    maximum: 5,
    description: 'Filter testimonials by rating (1 to 5)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  ratings?: number;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filter testimonials from this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  date1?: string;

  @ApiPropertyOptional({
    example: '2025-01-31',
    description: 'Filter testimonials up to this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  date2?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination (min 1)',
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
}
