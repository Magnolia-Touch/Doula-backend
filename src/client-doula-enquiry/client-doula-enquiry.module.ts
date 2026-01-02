import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientDoulaEnquiryController } from './client-doula-enquiry.controller';
import { ClientDoulaEnquiryService } from './client-doula-enquiry.service';

@Module({
    controllers: [ClientDoulaEnquiryController],
    providers: [ClientDoulaEnquiryService, PrismaService],
    exports: [ClientDoulaEnquiryService],
})
export class ClientDoulaEnquiryModule { }
