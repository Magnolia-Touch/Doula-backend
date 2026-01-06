import { Module } from '@nestjs/common';
import { IntakeFormController } from './intake-forms.controller';
import { IntakeFormService } from './intake-forms.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { StripeService } from 'src/stripe/stripe.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [IntakeFormController],
  providers: [IntakeFormService, PrismaService, StripeService],
  imports: [StripeModule, MailModule],
  exports: [IntakeFormService]
})
export class IntakeFormModule { }
