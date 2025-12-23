import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+911234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  name: string;
}
