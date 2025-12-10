import { IsArray, IsEmail, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
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

    @ApiProperty({
        type: 'object',
        additionalProperties: { type: 'number' },
        example: {
            "86ee0ee2-11fb-4f15-b403-9a94a3cfe868": 1000,
            "a9943bf1-3678-4981-a7f8-96d260c9bb55": 1500
        }
    })
    @Transform(({ value }) => {
        if (!value) return {};
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);     // <-- parses the JSON string from form-data
            } catch {
                return {};                    // or throw if you prefer
            }
        }
        return value;
    })
    @IsObject()
    services: Record<string, number>;
}
