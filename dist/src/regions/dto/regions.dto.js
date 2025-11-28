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
exports.UpdateRegionDto = exports.CreateRegionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateRegionDto {
    regionName;
    pincode;
    district;
    state;
    country;
    latitude;
    longitude;
    is_active;
}
exports.CreateRegionDto = CreateRegionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'South City' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRegionDto.prototype, "regionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '560001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRegionDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bengaluru' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRegionDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Karnataka' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRegionDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'India' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRegionDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '13.0213' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRegionDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '77.567' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRegionDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Boolean, example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRegionDto.prototype, "is_active", void 0);
class UpdateRegionDto {
    regionName;
    pincode;
    district;
    state;
    country;
    latitude;
    longitude;
    is_active;
}
exports.UpdateRegionDto = UpdateRegionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRegionDto.prototype, "regionName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRegionDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRegionDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRegionDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRegionDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRegionDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRegionDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Boolean }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRegionDto.prototype, "is_active", void 0);
//# sourceMappingURL=regions.dto.js.map