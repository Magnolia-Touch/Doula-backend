import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateDoulaStatusDto {
    @ApiProperty({ example: true, description: 'Whether the doula is active' })
    @IsBoolean()
    isActive: boolean;
}
