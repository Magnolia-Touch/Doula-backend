import {
    IsEmail,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsArray,
    IsUUID,
    ArrayNotEmpty,
} from 'class-validator';

export class CreateDoulaJoinEnquiryDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    regionIds: string[];
}
