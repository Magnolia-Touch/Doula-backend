import { Module } from '@nestjs/common';
import { ServicePricingService } from './service-pricing.service';
import { ServicePricingController } from './service-pricing.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesModule } from 'src/services/services.module';
import { ServicesService } from 'src/services/services.service';

@Module({
    imports: [ServicesModule],
    controllers: [ServicePricingController],
    providers: [ServicePricingService, PrismaService, ServicesService],
    exports: [ServicePricingModule]
})
export class ServicePricingModule { }
