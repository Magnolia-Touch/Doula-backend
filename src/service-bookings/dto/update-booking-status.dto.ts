// dto/update-schedule-status.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.ACTIVE,
    description: 'Updated booking status',
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiPropertyOptional({
    example: 'Payment confirmed by admin',
    description: 'Optional notes related to booking status update',
  })
  @IsString()
  @IsOptional()
  notes: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates whether the booking is paid',
  })
  @IsString()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({
    example: {
      paymentId: 'pay-uuid',
      amount: 1200,
      currency: 'INR',
      method: 'UPI',
    },
    description: 'Additional payment-related details',
  })
  paymentDetails?: any;
}
