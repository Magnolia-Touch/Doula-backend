import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  region: string;

  @IsString()
  @IsOptional()
  address: string;
}
