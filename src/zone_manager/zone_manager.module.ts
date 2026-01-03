import { Module } from '@nestjs/common';
import { ZoneManagerService } from './zone_manager.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ZoneManagerController } from './zone_manager.controller';
import { S3Module } from 'src/s3/s3.module';

@Module({
  exports: [ZoneManagerService],
  imports: [PrismaModule, S3Module],
  controllers: [ZoneManagerController],
  providers: [ZoneManagerService],
})
export class ZoneManagerModule { }
