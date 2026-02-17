import {
  IsEnum,
  IsOptional,
  IsNumberString,
  IsBoolean,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';

export class BookingStatsDto {
  @IsOptional()
  @IsString()
  regionId?: string;
}
