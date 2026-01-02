import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDoulaEnquiryDto } from './create-client-doula-enquiry.dto';

export class UpdateClientDoulaEnquiryDto extends PartialType(
    CreateClientDoulaEnquiryDto,
) { }
