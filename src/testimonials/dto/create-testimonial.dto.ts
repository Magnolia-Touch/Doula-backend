import { IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestimonialDto {
  @ApiProperty({
    example: 'd4b7d65a-9a46-4548-aabd-91c3bddd6e22',
    description: 'UUID of the Doula Profile',
  })
  @IsUUID()
  doulaProfileId: string;

  @ApiProperty({
    example: '8e9c559d-d9f6-438c-a36d-0a77c7a8c8c4',
    description: 'UUID of the Service for which feedback is given',
  })
  @IsUUID()
  servicePricingId: string;

  @ApiProperty({
    example: '3e9c559d-d9f6-438c-a36d-0177c7a8c8c1',
    description: 'UUID of the Booking',
  })
  @IsUUID()
  serviceBookingId: string;

  @ApiProperty({
    example: 5,
    description: 'Customer rating between 1–5',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  ratings: number;

  @ApiProperty({
    example:
      'The doula was extremely supportive throughout the entire journey.',
    description: 'Written review from the client',
  })
  @IsString()
  reviews: string;
}
