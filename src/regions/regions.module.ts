// src/region/region.module.ts
import { Module } from '@nestjs/common';
import { RegionService } from './regions.service';
import { RegionController } from './regions.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [RegionController],
    providers: [RegionService, PrismaService],
    exports: [RegionService],
})
export class RegionModule { }
