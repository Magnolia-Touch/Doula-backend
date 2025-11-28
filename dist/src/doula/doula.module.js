"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoulaModule = void 0;
const common_1 = require("@nestjs/common");
const doula_service_1 = require("./doula.service");
const prisma_module_1 = require("../prisma/prisma.module");
const doula_controller_1 = require("./doula.controller");
let DoulaModule = class DoulaModule {
};
exports.DoulaModule = DoulaModule;
exports.DoulaModule = DoulaModule = __decorate([
    (0, common_1.Module)({
        exports: [doula_service_1.DoulaService],
        imports: [prisma_module_1.PrismaModule],
        providers: [doula_service_1.DoulaService],
        controllers: [doula_controller_1.DoulaController]
    })
], DoulaModule);
//# sourceMappingURL=doula.module.js.map