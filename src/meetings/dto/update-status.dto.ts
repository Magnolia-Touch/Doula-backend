import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { MeetingStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ example: 'uuid-meeting-id' })
  @IsString()
  meetingId: string;

  @ApiProperty({ enum: MeetingStatus, example: 'COMPLETED' })
  @IsEnum(MeetingStatus)
  status: MeetingStatus;
}
