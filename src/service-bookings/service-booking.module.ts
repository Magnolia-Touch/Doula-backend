import { Module } from '@nestjs/common';
import { ServiceBookingService } from './service-booking.service';
import { ServiceBookingController } from './service-booking.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [ServiceBookingController],
    providers: [ServiceBookingService, PrismaService],
})
export class ServiceBookingModule { }
