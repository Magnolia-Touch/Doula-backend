import {
  IsArray,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { CreateCertificateDto } from './certificate.dto';
import { BadRequestException } from '@nestjs/common';

export class CreateDoulaDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  phone: string;

  @ApiProperty({
    type: [String],
    example: ['region-id-1', 'region-id-2'],
    description: 'Region IDs (array or comma-separated string)',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',');
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  regionIds: string[];

  @ApiProperty({ example: 'Experienced doula specializing in prenatal care' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Awarded Best Doula 2023' })
  @IsString()
  @IsOptional()
  achievements: string;

  @ApiProperty({ example: 'Certified Birth Doula' })
  @IsString()
  qualification: string;

  @ApiProperty({
    example: 4,
    description: 'Years of experience',
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  yoe: number;

  @ApiProperty({
    type: [String],
    example: ['English', 'Hindi'],
    description: 'Languages known (array or comma-separated string)',
  })
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',');
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Postnatal care', 'Lactation support'],
    description: 'Specialities (array or comma-separated string)',
  })
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',');
      }
    }
    return value;
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsOptional()
  specialities: string;

  // ----------------------------------------
  // Certificates (DTO1 inside DTO2)
  // ----------------------------------------
  // ⛔ accept as string ONLY
  @ApiPropertyOptional({
    type: 'string',
    example:
      '[{"title":"Birth Doula","issuer":"ABC Institute","year":2022}]',
    description: 'Certificates as JSON string',
  })
  @IsOptional()
  @IsString()
  certificates?: string;

  // ✅ derived, validated property
  get parsedCertificates(): CreateCertificateDto[] {
    if (!this.certificates) return [];

    const parsed = JSON.parse(this.certificates);

    if (!Array.isArray(parsed)) {
      throw new Error('Certificates must be an array');
    }

    return parsed.map((item) =>
      Object.assign(new CreateCertificateDto(), item),
    );
  }

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Profile image (jpg, jpeg, png)',
  })
  profile_image?: any;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
    description: 'Gallery images (jpg, jpeg, png). Max 5 files.',
  })
  gallery_image?: any[];
}
