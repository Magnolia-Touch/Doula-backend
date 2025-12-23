import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class CreateServicePricingDto {
  @ApiProperty({
    example: '6b117e03-d8cd-4c7a-b0fa-2a9300b8a812',
    description: 'UUID of the service',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({ example: 4999, description: 'Price of the service' })
  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsString()
  doulaId: string;
}

export class UpdateServicePricingDto {
  @ApiPropertyOptional({ example: 5999 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price: number;
}
