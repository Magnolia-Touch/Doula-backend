import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddDoulaImageDto {
  @ApiProperty({
    example: 'https://cdn.example.com/doula/image1.jpg',
    description: 'Publicly accessible image URL',
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    example: 'Doula assisting during prenatal session',
    description: 'Alternative text for accessibility',
  })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Marks this image as the primary/main image',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean = false;

  @ApiPropertyOptional({
    example: 1,
    description: 'Sort order for displaying images',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;
}
