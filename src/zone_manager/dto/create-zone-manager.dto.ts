import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class CreateZoneManagerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    example: [
      "96efbdce-d7cb-43bb-8787-626c198be1a4",
      "4fd68b32-cb85-4f8b-9375-d4477dc7c3ae"
    ],
    type: [String],
    description: "List of Region IDs to assign to the Zone Manager"
  })
  @IsArray()
  @IsString({ each: true })
  regionIds: string[];
}
