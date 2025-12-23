import { Module } from '@nestjs/common';
import { IntakeFormController } from './intake-forms.controller';
import { IntakeFormService } from './intake-forms.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [IntakeFormController],
  providers: [IntakeFormService, PrismaService],
})
export class IntakeFormModule {}
