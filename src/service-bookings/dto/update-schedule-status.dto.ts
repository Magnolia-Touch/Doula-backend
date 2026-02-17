// dto/update-schedule-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ServiceStatus } from '@prisma/client';

export class UpdateScheduleStatusDto {
  @ApiProperty({
    enum: ServiceStatus,
    example: ServiceStatus.CANCELED,
    description: 'Updated schedule/service status',
  })
  @IsEnum(ServiceStatus)
  status: ServiceStatus;
}
