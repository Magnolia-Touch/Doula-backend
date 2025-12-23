// dto/create-certificate.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  issuedBy?: string;

  @IsOptional()
  @IsString()
  year?: string;
}

export class UpdateCertificateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  issuedBy?: string;

  @IsOptional()
  @IsString()
  year?: string;
}
