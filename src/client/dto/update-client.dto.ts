import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @ApiPropertyOptional({
    description: 'Full name of the client',
    example: 'Riya Sharma',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Region where the client is located',
    example: 'Bangalore South',
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({
    description: 'Residential address of the client',
    example: '12th Cross, Indiranagar, Bangalore',
  })
  @IsString()
  @IsOptional()
  address?: string;
}
