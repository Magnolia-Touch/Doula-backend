import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientsService } from './client.service';
import { ClientController } from './client.controller';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  providers: [ClientsService],
  exports: [ClientsService],
  controllers: [ClientController],
})
export class ClientModule {}
