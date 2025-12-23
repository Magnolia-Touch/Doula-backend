import { IsEnum, IsOptional, IsNumberString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';

export class FilterUserDto {
  @ApiPropertyOptional({
    description: 'Status filter to identify active user.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return true;
  })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Role to filter (ADMIN, CLIENT, DOULA, ZONE_MANAGER)',
    example: Role.CLIENT,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Page number (string numeric allowed)',
    example: '1',
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Limit per page (string numeric allowed)',
    example: '10',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
