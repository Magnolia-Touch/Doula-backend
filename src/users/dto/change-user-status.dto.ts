import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class ChangeUserStatusDto {
    @ApiProperty({
        example: '7de77403-ca72-452b-abfa-296c26df8116',
        description: 'User UUID whose status needs to be changed',
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        example: true,
        description: 'Set user active (true) or inactive (false)',
    })
    @IsBoolean()
    is_active: boolean;
}
