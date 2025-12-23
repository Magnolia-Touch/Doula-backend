import { Module } from '@nestjs/common';
import { EnquiryController } from './enquiry-forms.controller';
import { EnquiryService } from './enquiry-forms.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { MeetingsModule } from 'src/meetings/meetings.module';
import { MeetingsService } from 'src/meetings/meetings.service';

@Module({
  imports: [MeetingsModule],
  controllers: [EnquiryController],
  providers: [EnquiryService, PrismaService, MeetingsService],
})
export class EnquiryModule {}
