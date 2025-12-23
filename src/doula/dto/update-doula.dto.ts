import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDoulaProfileDto {
  // User table
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  // DoulaProfile table
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  achievements?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  yoe?: number;

  @IsOptional()
  languages?: any;

  @IsOptional()
  specialities?: any;
}
