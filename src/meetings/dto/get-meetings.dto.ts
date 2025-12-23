import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsNumberString } from 'class-validator';

export class GetMeetingsDto {
  @ApiPropertyOptional({
    example: '2025-02-10',
    description: 'Filter meetings by date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELED'],
    example: 'SCHEDULED',
  })
  @IsOptional()
  @IsString()
  @IsIn(['SCHEDULED', 'COMPLETED', 'CANCELED'])
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELED';

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
