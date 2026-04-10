// dto/create-certificate.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { is } from 'date-fns/locale/is';

export class CreateCertificateDto {
  @ApiProperty({
    example: 'Certified Birth Doula',
    description: 'Name of the certificate',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'International Doula Institute',
    description: 'Issuing organization',
  })
  @IsOptional()
  @IsString()
  issuedBy?: string;

  @ApiPropertyOptional({
    example: '2022',
    description: 'Year the certificate was issued',
  })
  @IsOptional()
  @IsString()
  year?: string;
}

export class UpdateCertificateDto {
  @ApiPropertyOptional({
    example: 'Advanced Birth Doula Certification',
    description: 'Name of the certificate',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'World Doula Association',
    description: 'Issuing organization',
  })
  @IsOptional()
  @IsString()
  issuedBy?: string;

  @ApiPropertyOptional({
    example: '2023',
    description: 'Year the certificate was issued',
  })
  @IsOptional()
  @IsString()
  year?: string;
}
