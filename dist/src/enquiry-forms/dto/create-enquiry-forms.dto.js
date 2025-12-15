"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiryFormDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class EnquiryFormDto {
    name;
    email;
    phone;
    regionId;
    meetingsDate;
    meetingsTimeSlots;
    serviceId;
    seviceStartDate;
    serviceEndDate;
    visitFrequency = 1;
    serviceTimeSlots;
    additionalNotes;
}
exports.EnquiryFormDto = EnquiryFormDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9876543210' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'region-uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "regionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "meetingsDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00-11:00', description: 'Time slot for the service' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "meetingsTimeSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'service-uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-05', description: 'Service Start Date (ISO format)' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "seviceStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10', description: 'Service End Date (ISO format)' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "serviceEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: 'Visit Frequency for Services (e.g., twice a week)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnquiryFormDto.prototype, "visitFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00-11:00', description: 'Time slot for the service' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "serviceTimeSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Optional additional notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnquiryFormDto.prototype, "additionalNotes", void 0);
//# sourceMappingURL=create-enquiry-forms.dto.js.map