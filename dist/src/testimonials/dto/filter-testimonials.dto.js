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
exports.FilterTestimonialsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class FilterTestimonialsDto {
    doulaId;
    serviceId;
    page;
    limit;
}
exports.FilterTestimonialsDto = FilterTestimonialsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'd4b7d65a-9a46-4548-aabd-91c3bddd6e22',
        description: 'Filter testimonials for a specific doula',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterTestimonialsDto.prototype, "doulaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '8e9c559d-d9f6-438c-a36d-0a77c7a8c8c4',
        description: 'Filter testimonials based on a specific service',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterTestimonialsDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '1',
        description: 'Page number for pagination',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], FilterTestimonialsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '10',
        description: 'Limit number of testimonials per page',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], FilterTestimonialsDto.prototype, "limit", void 0);
//# sourceMappingURL=filter-testimonials.dto.js.map