import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class AddDoulaImageDto {
    @IsUrl()
    url: string;

    @IsOptional()
    @IsString()
    altText?: string;

    @IsOptional()
    @IsBoolean()
    isMain?: boolean = false;

    @IsOptional()
    @IsInt()
    sortOrder?: number = 0;
}
