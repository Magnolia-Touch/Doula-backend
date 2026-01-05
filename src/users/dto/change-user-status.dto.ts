import { IsBoolean, IsUUID } from 'class-validator';

export class ChangeUserStatusDto {
    @IsUUID()
    userId: string;

    @IsBoolean()
    is_active: boolean;
}
