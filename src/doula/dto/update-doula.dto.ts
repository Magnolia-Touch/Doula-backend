import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
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
  @ApiProperty({ example: "Certified birth doula with  10 years of experience", required: false })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ example: 'null', required: false })
  @IsOptional()
  @IsString()
  achievements?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  experience?: number;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  languages?: any;


  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  specialities?: any;

  @ApiProperty({ example: 'John Doe' })
  // ✅ Certificate edits
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCertificateItemDto)
  certificates?: UpdateCertificateItemDto[];


  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDoulaServicePricingDto)
  servicePricings?: UpdateDoulaServicePricingDto[];
}
