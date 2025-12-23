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
exports.CreateTestimonialDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTestimonialDto {
    doulaProfileId;
    serviceId;
    ratings;
    reviews;
}
exports.CreateTestimonialDto = CreateTestimonialDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'd4b7d65a-9a46-4548-aabd-91c3bddd6e22',
        description: 'UUID of the Doula Profile',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTestimonialDto.prototype, "doulaProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '8e9c559d-d9f6-438c-a36d-0a77c7a8c8c4',
        description: 'UUID of the Service for which feedback is given',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTestimonialDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Customer rating between 1–5',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateTestimonialDto.prototype, "ratings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'The doula was extremely supportive throughout the entire journey.',
        description: 'Written review from the client',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestimonialDto.prototype, "reviews", void 0);
//# sourceMappingURL=create-testimonial.dto.js.map