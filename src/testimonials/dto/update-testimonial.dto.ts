import { PartialType } from '@nestjs/mapped-types';
import { CreateTestimonialDto } from './create-testimonial.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {
  @ApiPropertyOptional({
    example: 4,
    description: 'Updated rating (1–5)',
  })
  ratings?: number;

  @ApiPropertyOptional({
    example: 'Updated feedback: Doula was helpful and kind.',
    description: 'Updated review text',
  })
  reviews?: string;
}
