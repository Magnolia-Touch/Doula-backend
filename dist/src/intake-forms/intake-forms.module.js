"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntakeFormModule = void 0;
const common_1 = require("@nestjs/common");
const intake_forms_controller_1 = require("./intake-forms.controller");
const intake_forms_service_1 = require("./intake-forms.service");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_module_1 = require("../stripe/stripe.module");
const stripe_service_1 = require("../stripe/stripe.service");
let IntakeFormModule = class IntakeFormModule {
};
exports.IntakeFormModule = IntakeFormModule;
exports.IntakeFormModule = IntakeFormModule = __decorate([
    (0, common_1.Module)({
        controllers: [intake_forms_controller_1.IntakeFormController],
        providers: [intake_forms_service_1.IntakeFormService, prisma_service_1.PrismaService, stripe_service_1.StripeService],
        imports: [stripe_module_1.StripeModule],
        exports: [intake_forms_service_1.IntakeFormService]
    })
], IntakeFormModule);
//# sourceMappingURL=intake-forms.module.js.map