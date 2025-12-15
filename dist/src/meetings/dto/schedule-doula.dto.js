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
exports.ScheduleDoulaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ScheduleDoulaDto {
    enquiryId;
    meetingsDate;
    meetingsTimeSlots;
    doulaId;
    additionalNotes;
}
exports.ScheduleDoulaDto = ScheduleDoulaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-enquiry-id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "enquiryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-10-12' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "meetingsDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00-11:00', description: 'Time slot for the service' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "meetingsTimeSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-slot-id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "doulaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Optional additional notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "additionalNotes", void 0);
//# sourceMappingURL=schedule-doula.dto.js.map