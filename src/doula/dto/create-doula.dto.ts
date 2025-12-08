import { IsArray, IsEmail, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateDoulaDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsPhoneNumber()
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


    @IsString()
    description: string;

    @IsString()
    achievements: string;

    @IsString()
    qualification: string;

    // yoe comes as "4" → convert to number
    @Transform(({ value }) => Number(value))
    @IsNumber()
    yoe: number;

    // languages also from string → convert to array
    @Transform(({ value }) => {
        if (!value) return [];
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value.split(','); // support comma separated
            }
        }
        return value;
    })
    @IsArray()
    @IsString({ each: true })
    languages: string[];
}
