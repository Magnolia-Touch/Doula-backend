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

  @ApiProperty({ example: ["a47516aa-a881-4e57-984e-5bb10ce1f236", "bd7516aa-a881-4e57-984e-5ba10ce1f234"] })
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
