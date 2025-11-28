import { IsEnum, IsOptional, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class FilterUserDto {
    @ApiPropertyOptional({ description: 'Role to filter (ADMIN, CLIENT, DOULA, ZONE_MANAGER)', example: Role.CLIENT })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional({ description: 'Page number (string numeric allowed)', example: '1' })
    @IsOptional()
    @IsNumberString()
    page?: string;

    @ApiPropertyOptional({ description: 'Limit per page (string numeric allowed)', example: '10' })
    @IsOptional()
    @IsNumberString()
    limit?: string;
}
