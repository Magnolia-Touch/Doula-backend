import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class cancelDto {
  @ApiProperty({ example: 'uuid-meeting-id' })
  @IsString()
  meetingId: string;
}
