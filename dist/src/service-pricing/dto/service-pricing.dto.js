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
exports.UpdateServicePricingDto = exports.CreateServicePricingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateServicePricingDto {
    serviceId;
    price;
}
exports.CreateServicePricingDto = CreateServicePricingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '6b117e03-d8cd-4c7a-b0fa-2a9300b8a812',
        description: 'UUID of the service'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServicePricingDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4999, description: 'Price of the service' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateServicePricingDto.prototype, "price", void 0);
class UpdateServicePricingDto {
    price;
}
exports.UpdateServicePricingDto = UpdateServicePricingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5999 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateServicePricingDto.prototype, "price", void 0);
//# sourceMappingURL=service-pricing.dto.js.map