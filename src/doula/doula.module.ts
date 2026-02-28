import { Module } from '@nestjs/common';
import { DoulaService } from './doula.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DoulaController } from './doula.controller';
import { S3Module } from 'src/s3/s3.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  exports: [DoulaService],
  imports: [PrismaModule, S3Module, MailModule],
  providers: [DoulaService],
  controllers: [DoulaController],
})
export class DoulaModule { }
