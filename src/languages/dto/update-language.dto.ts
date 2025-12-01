import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateLanguageDto {
    @ApiProperty({ example: "English", required: false })
    @IsString()
    @IsOptional()
    name?: string;
}
