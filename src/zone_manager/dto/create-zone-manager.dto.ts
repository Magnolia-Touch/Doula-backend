import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class CreateZoneManagerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'zonemanager@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  phone: string;

  @ApiProperty({
    example: [
      '96efbdce-d7cb-43bb-8787-626c198be1a4',
      '4fd68b32-cb85-4f8b-9375-d4477dc7c3ae',
    ],
    type: [String],
    description: 'List of Region IDs to assign to the Zone Manager',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',');
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  regionIds: string[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Profile image (jpg, jpeg, png, max 5MB)',
  })
  profile_image?: any;
}
