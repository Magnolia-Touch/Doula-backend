import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from 'class-validator';

export class CreateDirectTestimonialDto {
    @ApiProperty({
        example: 'd4b7d65a-9a46-4548-aabd-91c3bddd6e22',
        description: 'UUID of the Doula Profile',
    })
    @IsUUID()
    doulaProfileId!: string;

    @ApiProperty({
        example: '8e9c559d-d9f6-438c-a36d-0a77c7a8c8c4',
        description: 'UUID of the Service Pricing entry',
    })
    @IsUUID()
    servicePricingId!: string;

    @ApiProperty({
        example: 'Ananya Rao',
        description: 'Client name to register/use for this testimonial',
    })
    @IsString()
    clientName!: string;

    @ApiProperty({
        example: 'ananya.rao@example.com',
        description: 'Client email to register/use for this testimonial',
    })
    @IsEmail()
    clientEmail!: string;

    @ApiProperty({
        example: '+919876543210',
        description: 'Client phone number (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    clientPhone?: string;

    @ApiProperty({
        example: 5,
        description: 'Customer rating between 1 and 5',
    })
    @IsInt()
    @Min(1)
    @Max(5)
    ratings!: number;

    @ApiProperty({
        example: 'Amazing care and support throughout the journey.',
        description: 'Written review text',
    })
    @IsString()
    reviews!: string;
}