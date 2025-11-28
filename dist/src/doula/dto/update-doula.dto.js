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
exports.UpdateDoulaRegionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateDoulaRegionDto {
    profileId;
    regionIds;
    purpose;
}
exports.UpdateDoulaRegionDto = UpdateDoulaRegionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '4cb9ddc3-4766-46be-86a7-7c5bdf1b82d5' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDoulaRegionDto.prototype, "profileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            '96efbdce-d7cb-43bb-8787-626c198be1a4',
            '4fd68b32-cb85-4f8b-9375-d4477dc7c3ae',
        ],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateDoulaRegionDto.prototype, "regionIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "'add' or 'remove'", description: "Use 'add' to attach regions or 'remove' to detach" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDoulaRegionDto.prototype, "purpose", void 0);
//# sourceMappingURL=update-doula.dto.js.map