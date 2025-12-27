import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { UpdateCertificateDto } from './certificate.dto';

class UpdateCertificateItemDto {
  @IsString()
  certificateId: string;

  @ValidateNested()
  @Type(() => UpdateCertificateDto)
  data: UpdateCertificateDto;
}

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
  yoe?: number;

  @IsOptional()
  languages?: any;

  @IsOptional()
  specialities?: any;

  // ✅ Certificate edits
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCertificateItemDto)
  certificates?: UpdateCertificateItemDto[];
}
