import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateClientDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    region: string;

    @IsString()
    @IsOptional()
    address: string;
}
