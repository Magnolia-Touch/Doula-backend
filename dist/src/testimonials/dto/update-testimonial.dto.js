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
exports.UpdateTestimonialDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_testimonial_dto_1 = require("./create-testimonial.dto");
const swagger_1 = require("@nestjs/swagger");
class UpdateTestimonialDto extends (0, mapped_types_1.PartialType)(create_testimonial_dto_1.CreateTestimonialDto) {
    ratings;
    reviews;
}
exports.UpdateTestimonialDto = UpdateTestimonialDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 4,
        description: "Updated rating (1–5)"
    }),
    __metadata("design:type", Number)
], UpdateTestimonialDto.prototype, "ratings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "Updated feedback: Doula was helpful and kind.",
        description: "Updated review text"
    }),
    __metadata("design:type", String)
], UpdateTestimonialDto.prototype, "reviews", void 0);
//# sourceMappingURL=update-testimonial.dto.js.map