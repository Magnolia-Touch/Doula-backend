import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateClientDto {
  @ApiProperty({
    description: 'Full name of the client',
    example: 'Riya Sharma',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the client',
    example: 'riya.sharma@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mobile phone number with country code',
    example: '+919876543210',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'Region where the client is located',
    example: 'Bangalore South',
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({
    description: 'Residential address of the client',
    example: '12th Cross, Indiranagar, Bangalore',
  })
  @IsString()
  @IsOptional()
  address?: string;
}
