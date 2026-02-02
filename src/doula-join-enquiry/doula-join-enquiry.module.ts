import { Module } from '@nestjs/common';
import { DoulaJoinEnquiryService } from './doula-join-enquiry.service';
import { DoulaJoinEnquiryController } from './doula-join-enquiry.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [MailerModule],
    controllers: [DoulaJoinEnquiryController],
    providers: [DoulaJoinEnquiryService, PrismaService],
    exports: [DoulaJoinEnquiryService],
})
export class DoulaJoinEnquiryModule { }
