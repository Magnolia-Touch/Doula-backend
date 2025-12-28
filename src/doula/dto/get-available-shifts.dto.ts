import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class GetAvailableShiftsDto {
  @ApiProperty({
    description: 'Start date in ISO format (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date in ISO format (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Visit frequency (number of days between each visit)',
    example: 7,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  visitFrequency: number;
}
