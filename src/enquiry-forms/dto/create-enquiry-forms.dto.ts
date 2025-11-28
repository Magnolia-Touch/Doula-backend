import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnquiryFormDto {
    @ApiProperty({ example: 'region-uuid' })
    @IsString()
    regionId: string;

    @ApiProperty({ example: 'slot-uuid' })
    @IsString()
    slotId: string;

    @ApiProperty({ example: 'service-uuid' })
    @IsString()
    serviceId: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsString()
    email: string;

    @ApiProperty({ example: '+919876543210' })
    @IsString()
    phone: string;

    @ApiProperty({ required: false, description: 'Optional additional notes' })
    @IsOptional()
    @IsString()
    additionalNotes?: string;
}
