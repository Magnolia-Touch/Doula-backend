import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { DoulaServiceAvailabilityController } from "./service-availability.controller";
import { DoulaServiceAvailabilityService } from "./service-availability.service";

@Module({
    controllers: [DoulaServiceAvailabilityController],
    providers: [DoulaServiceAvailabilityService, PrismaService],
})
export class DoulaServiceAvailabilityModule { }
