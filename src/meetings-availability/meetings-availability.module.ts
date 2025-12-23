import { Module } from '@nestjs/common';
import { AvailableSlotsService } from './meetings-availability.service';
import { AvailableSlotsController } from './meetings-availability.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AvailableSlotsController],
  providers: [AvailableSlotsService, PrismaService],
})
export class AvailableSlotsModule {}
