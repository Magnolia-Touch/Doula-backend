import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [MailerModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, PrismaService, RolesGuard, Reflector],
  exports: [MeetingsService],
})
export class MeetingsModule {}
