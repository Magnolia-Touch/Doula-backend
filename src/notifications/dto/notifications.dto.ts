import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    required: false,
    type: 'array',
    example: ['email', 'push'],
  })
  @IsOptional()
  channels?: any[];
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
