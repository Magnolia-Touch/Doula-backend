import { PartialType } from '@nestjs/mapped-types';
import { CreateDoulaJoinEnquiryDto } from './create-doula-join-enquiry.dto';

export class UpdateDoulaJoinEnquiryDto extends PartialType(
    CreateDoulaJoinEnquiryDto,
) { }
