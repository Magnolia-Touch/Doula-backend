"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePricingModule = void 0;
const common_1 = require("@nestjs/common");
const service_pricing_service_1 = require("./service-pricing.service");
const service_pricing_controller_1 = require("./service-pricing.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const services_module_1 = require("../services/services.module");
const services_service_1 = require("../services/services.service");
let ServicePricingModule = class ServicePricingModule {
};
exports.ServicePricingModule = ServicePricingModule;
exports.ServicePricingModule = ServicePricingModule = __decorate([
    (0, common_1.Module)({
        imports: [services_module_1.ServicesModule],
        controllers: [service_pricing_controller_1.ServicePricingController],
        providers: [service_pricing_service_1.ServicePricingService, prisma_service_1.PrismaService, services_service_1.ServicesService],
        exports: [ServicePricingModule]
    })
], ServicePricingModule);
//# sourceMappingURL=service-pricing.module.js.map