import { IsEmail, IsPhoneNumber, IsString } from "class-validator"

export class CreateAdminDto {
    @IsString()
    name: string

    @IsEmail()
    email: string

    @IsPhoneNumber()
    phone: string

}



