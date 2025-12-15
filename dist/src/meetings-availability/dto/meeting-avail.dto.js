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
exports.UpdateSlotsForMeetingTimeDto = exports.AvailableSlotsForMeetingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class AvailableSlotsForMeetingDto {
    weekday;
    startTime;
    endTime;
}
exports.AvailableSlotsForMeetingDto = AvailableSlotsForMeetingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.WeekDays,
        example: client_1.WeekDays.MONDAY,
        description: 'Day of the week',
    }),
    (0, class_validator_1.IsEnum)(client_1.WeekDays, {
        message: 'weekday must be one of MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY',
    }),
    __metadata("design:type", String)
], AvailableSlotsForMeetingDto.prototype, "weekday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00', description: 'Start time (HH:mm)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AvailableSlotsForMeetingDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '11:00', description: 'End time (HH:mm)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AvailableSlotsForMeetingDto.prototype, "endTime", void 0);
class UpdateSlotsForMeetingTimeDto {
    timeSlotId;
    startTime;
    endTime;
}
exports.UpdateSlotsForMeetingTimeDto = UpdateSlotsForMeetingTimeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'time-slot-uuid', description: 'Time slot id (entry) that you want to update' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSlotsForMeetingTimeDto.prototype, "timeSlotId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSlotsForMeetingTimeDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '11:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSlotsForMeetingTimeDto.prototype, "endTime", void 0);
//# sourceMappingURL=meeting-avail.dto.js.map