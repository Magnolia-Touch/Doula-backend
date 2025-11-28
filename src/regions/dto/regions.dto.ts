import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRegionDto {
    @ApiProperty({ example: 'South City' })
    @IsString()
    regionName: string;

    @ApiProperty({ example: '560001' })
    @IsString()
    pincode: string;

    @ApiProperty({ example: 'Bengaluru' })
    @IsString()
    district: string;

    @ApiProperty({ example: 'Karnataka' })
    @IsString()
    state: string;

    @ApiProperty({ example: 'India' })
    @IsString()
    country: string;

    @ApiProperty({ example: '13.0213' })
    @IsString()
    latitude: string;

    @ApiProperty({ example: '77.567' })
    @IsString()
    longitude: string;

    @ApiProperty({ type: Boolean, example: true })
    @IsBoolean()
    is_active: boolean;
}

export class UpdateRegionDto {
    @ApiPropertyOptional() @IsOptional() @IsString() regionName?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() pincode?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() district?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() latitude?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() longitude?: string;
    @ApiPropertyOptional({ type: Boolean }) @IsOptional() @IsBoolean() is_active?: boolean;
}
