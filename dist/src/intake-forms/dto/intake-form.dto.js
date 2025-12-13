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
exports.BookDoulaDto = exports.IntakeFormDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class IntakeFormDto {
    name;
    email;
    phone;
    doulaProfileId;
    serviceId;
    address;
    buffer;
    enquiryId;
}
exports.IntakeFormDto = IntakeFormDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Name of the person (optional)', example: 'Jane Doe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntakeFormDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Email of the person (optional)', example: 'jane@example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntakeFormDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Phone number (optional)', example: '+919876543210' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntakeFormDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'doula-uuid', description: 'Doula profile id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntakeFormDto.prototype, "doulaProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'service-uuid', description: 'Service pricing id or service id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntakeFormDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Street, City, State', description: 'Address for the service' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntakeFormDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 60, description: 'Buffer time in minutes' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IntakeFormDto.prototype, "buffer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-enquiry-id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntakeFormDto.prototype, "enquiryId", void 0);
class BookDoulaDto {
    name;
    email;
    phone;
    location;
    address;
    doulaProfileId;
    serviceId;
    serviceStartDate;
    servicEndDate;
    visitFrequency = 1;
    timeSlots;
    buffer;
}
exports.BookDoulaDto = BookDoulaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Name of the person (optional)', example: 'Jane Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Email of the person (optional)', example: 'jane@example.com' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Phone number (optional)', example: '+919876543210' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Street, City, State', description: 'Address for the service' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Street, City, State', description: 'Address for the service' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'doula-uuid', description: 'Doula profile id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "doulaProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'service-uuid', description: 'Service pricing id or service id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-05', description: 'Service Start Date (ISO format)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "serviceStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10', description: 'Service End Date (ISO format)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "servicEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: 'Visit Frequency for Services (e.g., twice a week)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], BookDoulaDto.prototype, "visitFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00-11:00', description: 'Time slot for the service' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDoulaDto.prototype, "timeSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 60, description: 'Buffer time in minutes' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BookDoulaDto.prototype, "buffer", void 0);
//# sourceMappingURL=intake-form.dto.js.map