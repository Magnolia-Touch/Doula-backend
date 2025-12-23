import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterTestimonialsDto {
  @ApiPropertyOptional({
    example: 'd4b7d65a-9a46-4548-aabd-91c3bddd6e22',
    description: 'Filter testimonials for a specific doula',
  })
  @IsOptional()
  @IsString()
  doulaId?: string;

  @ApiPropertyOptional({
    example: '8e9c559d-d9f6-438c-a36d-0a77c7a8c8c4',
    description: 'Filter testimonials based on a specific service',
  })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'Page number for pagination',
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    example: '10',
    description: 'Limit number of testimonials per page',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
