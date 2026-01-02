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
exports.UpdateMeetingStatusDto = exports.UpdateClientDoulaEnquiryDto = exports.ScheduleDoulaDto = void 0;
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class ScheduleDoulaDto {
    enquiryId;
    date;
    time;
    notes;
    serviceName;
    doulaIds;
}
exports.ScheduleDoulaDto = ScheduleDoulaDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "enquiryId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDoulaDto.prototype, "serviceName", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], ScheduleDoulaDto.prototype, "doulaIds", void 0);
class UpdateClientDoulaEnquiryDto {
    date;
    time;
    notes;
    doulaId;
}
exports.UpdateClientDoulaEnquiryDto = UpdateClientDoulaEnquiryDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClientDoulaEnquiryDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClientDoulaEnquiryDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClientDoulaEnquiryDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateClientDoulaEnquiryDto.prototype, "doulaId", void 0);
class UpdateMeetingStatusDto {
    status;
}
exports.UpdateMeetingStatusDto = UpdateMeetingStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.MeetingStatus),
    __metadata("design:type", String)
], UpdateMeetingStatusDto.prototype, "status", void 0);
//# sourceMappingURL=schedule-doula.dto.js.map