import { Module } from '@nestjs/common';
import { DoulaService } from './doula.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DoulaController } from './doula.controller';
import { S3Module } from 'src/s3/s3.module';

@Module({
  exports: [DoulaService],
  imports: [PrismaModule, S3Module],
  providers: [DoulaService],
  controllers: [DoulaController],
})
export class DoulaModule { }
