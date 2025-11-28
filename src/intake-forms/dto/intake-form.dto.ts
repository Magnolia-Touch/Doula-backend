import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IntakeFormDto {
    @ApiProperty({ required: false, description: 'Name of the person (optional)', example: 'Jane Doe' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false, description: 'Email of the person (optional)', example: 'jane@example.com' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({ required: false, description: 'Phone number (optional)', example: '+919876543210' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'date-uuid', description: 'Slot identifier' })
    @IsString()
    slotId: string;

    @ApiProperty({ example: 'doula-uuid', description: 'Doula profile id' })
    @IsString()
    doulaProfileId: string;

    @ApiProperty({ example: 'service-uuid', description: 'Service pricing id or service id' })
    @IsString()
    serviceId: string;

    @ApiProperty({ example: 'Street, City, State', description: 'Address for the service' })
    @IsString()
    address: string;

    @ApiProperty({ example: 60, description: 'Buffer time in minutes' })
    @IsNumber()
    buffer: number;
}
