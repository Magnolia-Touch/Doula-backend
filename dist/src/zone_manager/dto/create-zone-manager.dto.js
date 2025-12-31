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
exports.CreateZoneManagerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateZoneManagerDto {
    name;
    email;
    phone;
    regionIds;
    profile_image;
}
exports.CreateZoneManagerDto = CreateZoneManagerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateZoneManagerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'zonemanager@test.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateZoneManagerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateZoneManagerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            '96efbdce-d7cb-43bb-8787-626c198be1a4',
            '4fd68b32-cb85-4f8b-9375-d4477dc7c3ae',
        ],
        type: [String],
        description: 'List of Region IDs to assign to the Zone Manager',
    }),
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
], CreateZoneManagerDto.prototype, "regionIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        required: false,
        description: 'Profile image (jpg, jpeg, png, max 5MB)',
    }),
    __metadata("design:type", Object)
], CreateZoneManagerDto.prototype, "profile_image", void 0);
//# sourceMappingURL=create-zone-manager.dto.js.map