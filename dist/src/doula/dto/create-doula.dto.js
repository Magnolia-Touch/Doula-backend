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
exports.CreateDoulaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateDoulaDto {
    name;
    email;
    phone;
    regionIds;
    description;
    achievements;
    qualification;
    yoe;
    languages;
    services;
}
exports.CreateDoulaDto = CreateDoulaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDoulaDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateDoulaDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDoulaDto.prototype, "phone", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value.split(',');
            }
        }
        return value;
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDoulaDto.prototype, "regionIds", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDoulaDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDoulaDto.prototype, "achievements", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDoulaDto.prototype, "qualification", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDoulaDto.prototype, "yoe", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return [];
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value.split(',');
            }
        }
        return value;
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDoulaDto.prototype, "languages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'object',
        additionalProperties: { type: 'number' },
        example: {
            "86ee0ee2-11fb-4f15-b403-9a94a3cfe868": 1000,
            "a9943bf1-3678-4981-a7f8-96d260c9bb55": 1500
        }
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return {};
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return {};
            }
        }
        return value;
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateDoulaDto.prototype, "services", void 0);
//# sourceMappingURL=create-doula.dto.js.map