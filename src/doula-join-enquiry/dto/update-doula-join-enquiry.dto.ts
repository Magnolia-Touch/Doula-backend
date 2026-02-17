import { PartialType } from '@nestjs/mapped-types';
import { CreateDoulaJoinEnquiryDto } from './create-doula-join-enquiry.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { JoinEnquiryStatus } from '@prisma/client';

export class UpdateDoulaJoinEnquiryDto extends PartialType(
  CreateDoulaJoinEnquiryDto,
) {
  @IsOptional()
  @IsEnum(JoinEnquiryStatus)
  status?: JoinEnquiryStatus;
}
