import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateLanguageDto {
    @ApiProperty({ example: "English" })
    @IsString()
    name: string;
}
