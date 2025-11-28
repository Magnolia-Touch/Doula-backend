import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateDoulaRegionDto {
    @ApiProperty({ example: '4cb9ddc3-4766-46be-86a7-7c5bdf1b82d5' })
    @IsString()
    profileId: string;

    @ApiProperty({
        example: [
            '96efbdce-d7cb-43bb-8787-626c198be1a4',
            '4fd68b32-cb85-4f8b-9375-d4477dc7c3ae',
        ],
    })
    @IsArray()
    @IsString({ each: true })
    regionIds: string[];

    @ApiProperty({ example: "'add' or 'remove'", description: "Use 'add' to attach regions or 'remove' to detach" })
    @IsString()
    purpose: string;
}
