import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class CreateZoneManagerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

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
}
