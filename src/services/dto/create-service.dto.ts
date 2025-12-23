import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsPositive,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Pregnancy Yoga' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Relaxation & breathing exercise support' })
  @IsOptional()
  @IsString()
  description?: string;
}
