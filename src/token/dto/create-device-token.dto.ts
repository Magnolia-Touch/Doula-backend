import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceTokenDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  token: string;
}
