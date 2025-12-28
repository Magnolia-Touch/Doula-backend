import { Module } from '@nestjs/common';
import { IntakeFormController } from './intake-forms.controller';
import { IntakeFormService } from './intake-forms.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  controllers: [IntakeFormController],
  providers: [IntakeFormService, PrismaService, StripeService],
  imports: [StripeModule],
  exports: [IntakeFormService]
})
export class IntakeFormModule { }
