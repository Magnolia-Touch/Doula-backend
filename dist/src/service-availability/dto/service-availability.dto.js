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
exports.UpdateDoulaServiceAvailabilityDto = exports.CreateDoulaServiceAvailabilityDto = exports.ServiceAvailabilityDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ServiceAvailabilityDto {
    MORNING;
    NIGHT;
    FULLDAY;
}
exports.ServiceAvailabilityDto = ServiceAvailabilityDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ServiceAvailabilityDto.prototype, "MORNING", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ServiceAvailabilityDto.prototype, "NIGHT", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ServiceAvailabilityDto.prototype, "FULLDAY", void 0);
class CreateDoulaServiceAvailabilityDto {
    date1;
    date2;
    availability;
}
exports.CreateDoulaServiceAvailabilityDto = CreateDoulaServiceAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-10-30',
        description: 'Start date (required)',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDoulaServiceAvailabilityDto.prototype, "date1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2025-11-02',
        description: 'End date (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDoulaServiceAvailabilityDto.prototype, "date2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: ServiceAvailabilityDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ServiceAvailabilityDto),
    __metadata("design:type", ServiceAvailabilityDto)
], CreateDoulaServiceAvailabilityDto.prototype, "availability", void 0);
class UpdateDoulaServiceAvailabilityDto {
    availability;
}
exports.UpdateDoulaServiceAvailabilityDto = UpdateDoulaServiceAvailabilityDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Partial update of service availability',
        example: {
            MORNING: false,
            NIGHT: true,
            FULLDAY: false,
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ServiceAvailabilityDto),
    __metadata("design:type", Object)
], UpdateDoulaServiceAvailabilityDto.prototype, "availability", void 0);
//# sourceMappingURL=service-availability.dto.js.map