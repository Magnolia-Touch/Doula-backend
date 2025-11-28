import { IsString, IsOptional } from 'class-validator';

export class CreateNoteDto {
    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    bookingId?: string;

    @IsOptional()
    @IsString()
    userId?: string;
}
