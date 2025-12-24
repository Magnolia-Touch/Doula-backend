// dto/update-schedule-status.dto.ts
import { IsEnum } from 'class-validator';
import { ServiceStatus } from '@prisma/client';

export class UpdateScheduleStatusDto {
    @IsEnum(ServiceStatus)
    status: ServiceStatus;
}
