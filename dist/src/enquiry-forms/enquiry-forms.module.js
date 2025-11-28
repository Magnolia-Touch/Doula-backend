"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiryModule = void 0;
const common_1 = require("@nestjs/common");
const enquiry_forms_controller_1 = require("./enquiry-forms.controller");
const enquiry_forms_service_1 = require("./enquiry-forms.service");
const prisma_service_1 = require("../prisma/prisma.service");
const meetings_module_1 = require("../meetings/meetings.module");
const meetings_service_1 = require("../meetings/meetings.service");
let EnquiryModule = class EnquiryModule {
};
exports.EnquiryModule = EnquiryModule;
exports.EnquiryModule = EnquiryModule = __decorate([
    (0, common_1.Module)({
        imports: [meetings_module_1.MeetingsModule],
        controllers: [enquiry_forms_controller_1.EnquiryController],
        providers: [
            enquiry_forms_service_1.EnquiryService,
            prisma_service_1.PrismaService,
            meetings_service_1.MeetingsService
        ],
    })
], EnquiryModule);
//# sourceMappingURL=enquiry-forms.module.js.map