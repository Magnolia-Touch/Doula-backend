import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceBreakdownDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsOptional()
  morning: number;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  @IsOptional()
  night: number;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  @IsOptional()
  fullday: number;
}

export class CreateServicePricingDto {
  @ApiProperty({
    example: '6b117e03-d8cd-4c7a-b0fa-2a9300b8a812',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({
    type: PriceBreakdownDto,
  })
  @ValidateNested()
  @Type(() => PriceBreakdownDto)
  price: PriceBreakdownDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doulaId?: string;
}

export class UpdateServicePricingDto {
  @ApiPropertyOptional({
    type: PriceBreakdownDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceBreakdownDto)
  price?: PriceBreakdownDto;
}
