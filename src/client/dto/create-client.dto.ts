import { IsEmail, IsPhoneNumber, IsString } from "class-validator"

export class CreateClientDto {
    @IsString()
    name: string

    @IsEmail()
    email: string

    @IsPhoneNumber()
    phone: string

}



