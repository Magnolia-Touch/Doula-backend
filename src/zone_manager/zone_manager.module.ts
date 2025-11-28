import { Module } from "@nestjs/common";
import { ZoneManagerService } from "./zone_manager.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { ZoneManagerController } from "./zone_manager.controller";

@Module({
    exports: [ZoneManagerService],
    imports: [PrismaModule],
    controllers: [ZoneManagerController],
    providers: [ZoneManagerService]
})
export class ZoneManagerModule { }