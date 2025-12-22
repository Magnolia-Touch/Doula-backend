import { IsArray, IsEmail, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { CreateCertificateDto } from './certificate.dto';
import { BadRequestException } from '@nestjs/common';

export class CreateDoulaDto {
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


    @IsString()
    description: string;

    @IsString()
    @IsOptional()
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
    @IsOptional()
    @IsString({ each: true })
    @IsOptional()
    specialities: string;

    // ----------------------------------------
    // Certificates (DTO1 inside DTO2)
    // ----------------------------------------
    // ⛔ accept as string ONLY
    @IsOptional()
    @IsString()
    certificates?: string;

    // ✅ derived, validated property
    get parsedCertificates(): CreateCertificateDto[] {
        if (!this.certificates) return [];

        const parsed = JSON.parse(this.certificates);

        if (!Array.isArray(parsed)) {
            throw new Error('Certificates must be an array');
        }

        return parsed.map((item) =>
            Object.assign(new CreateCertificateDto(), item),
        );
    }



}
