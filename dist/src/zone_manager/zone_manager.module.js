"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneManagerModule = void 0;
const common_1 = require("@nestjs/common");
const zone_manager_service_1 = require("./zone_manager.service");
const prisma_module_1 = require("../prisma/prisma.module");
const zone_manager_controller_1 = require("./zone_manager.controller");
let ZoneManagerModule = class ZoneManagerModule {
};
exports.ZoneManagerModule = ZoneManagerModule;
exports.ZoneManagerModule = ZoneManagerModule = __decorate([
    (0, common_1.Module)({
        exports: [zone_manager_service_1.ZoneManagerService],
        imports: [prisma_module_1.PrismaModule],
        controllers: [zone_manager_controller_1.ZoneManagerController],
        providers: [zone_manager_service_1.ZoneManagerService]
    })
], ZoneManagerModule);
//# sourceMappingURL=zone_manager.module.js.map