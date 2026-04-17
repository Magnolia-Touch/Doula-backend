import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class UpdateUserCommissionDto {
  @ApiProperty({
    description: 'User ID of the client whose commission should be updated',
    example: '43d9b6d3-727c-4e09-9b0d-42b6c231ee70',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Commission percentage value',
    example: 12.5,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commission: number;
}
