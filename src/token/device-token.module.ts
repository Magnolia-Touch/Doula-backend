import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { DeviceTokenController } from "./device-token.controller";
import { DeviceTokenService } from "./device-token.service";

@Module({
    controllers: [DeviceTokenController],
    providers: [DeviceTokenService, PrismaService],
})
export class DeviceTokenModule { }
