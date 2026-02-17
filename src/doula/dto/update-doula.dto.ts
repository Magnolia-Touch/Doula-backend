import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { UpdateCertificateDto } from './certificate.dto';
import { PriceBreakdownDto } from 'src/service-pricing/dto/service-pricing.dto';
import { ApiProperty } from '@nestjs/swagger';

class UpdateCertificateItemDto {
  @IsString()
  certificateId: string;

  @ValidateNested()
  @Type(() => UpdateCertificateDto)
  data: UpdateCertificateDto;
}

export class UpdateDoulaServicePricingDto {
  @IsString()
  servicePricingId: string;

  @ValidateNested()
  @Type(() => PriceBreakdownDto)
  price: PriceBreakdownDto;
}

export class UpdateDoulaProfileDto {
  // User table
  @ApiProperty({ example: 'Bambini Doula', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  // DoulaProfile table
  @ApiProperty({
    example: 'Certified birth doula with  10 years of experience',
    required: false,
  })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ example: 'null', required: false })
  @IsOptional()
  @IsString()
  achievements?: string;

  @ApiProperty({ example: 'physiology of pregnancy/labor', required: false })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  experience?: number;

  @ApiProperty({ example: ['English', 'Hindi', 'Tamil'] })
  @IsOptional()
  languages?: any;

  @ApiProperty({ example: ['Prenatal Care', 'Postpartum Support'] })
  @IsOptional()
  specialities?: any;

  @ApiProperty({
    example: {
      certificateId: '767a0cc7-1935-498f-8014-5d841d75fb2b',
      data: {
        name: 'Advanceda Birth Support',
        issuedBy: 'WHO',
        year: '2022',
      },
    },
  })
  // ✅ Certificate edits
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCertificateItemDto)
  certificates?: UpdateCertificateItemDto[];

  @ApiProperty({
    example: {
      servicePricingId: '243fdd15-587d-4e1d-8009-4b360904f013',
      price: {
        morning: 1000,
        night: 10,
        fullday: 10,
      },
    },
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDoulaServicePricingDto)
  servicePricings?: UpdateDoulaServicePricingDto[];
}
