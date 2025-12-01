import { IsArray, IsEmail, IsNumber, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoulaDto {
    @ApiProperty({ example: 'Jane Doe', description: 'Full name of the doula' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'jane@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '+919876543210', description: 'Phone with country code' })
    @IsPhoneNumber()
    phone: string;

    @ApiProperty({
        example: [
            '96efbdce-d7cb-43bb-8787-626c198be1a4',
            '4fd68b32-cb85-4f8b-9375-d4477dc7c3ae',
        ],
        description: 'List of region UUIDs that the doula will serve',
    })
    @IsArray()
    @IsString({ each: true })
    regionIds: string[];

    @IsString()
    description: string;

    @IsString()
    achievements: string;

    @IsString()
    qualification: string;

    @IsNumber()
    yoe: number;

    @ApiProperty({
        example: ["English", "Hindi", "Tamil"]
    })
    @IsArray()
    @IsString({ each: true })
    languages: string[];
}

