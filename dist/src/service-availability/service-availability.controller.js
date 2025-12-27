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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoulaServiceAvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const service_availability_service_1 = require("./service-availability.service");
const swagger_1 = require("@nestjs/swagger");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const service_availability_dto_1 = require("./dto/service-availability.dto");
const off_days_dto_1 = require("./dto/off-days.dto");
let DoulaServiceAvailabilityController = class DoulaServiceAvailabilityController {
    service;
    constructor(service) {
        this.service = service;
    }
    async createAvailability(dto, req) {
        return this.service.createAvailability(dto, req.user);
    }
    async findAll(req) {
        return this.service.findAll(req.user);
    }
    async findOne(id, req) {
        return this.service.findOne(id, req.user);
    }
    async update(id, req, dto) {
        return this.service.update(id, dto, req.user);
    }
    async remove(id, req) {
        return this.service.remove(id, req.user);
    }
    async createOffDays(dto, req) {
        return this.service.createOffDays(dto, req.user);
    }
    async getOffDays(req) {
        console.log(11);
        return this.service.getOffDays(req.user);
    }
    async getOffdaysbyId(id, req) {
        return this.service.getOffdaysbyId(id, req.user);
    }
    async updateOffdays(id, dto, req) {
        return this.service.updateOffdays(id, dto, req.user);
    }
    async removeOffdays(id, req) {
        return this.service.removeOffdays(id, req.user);
    }
};
exports.DoulaServiceAvailabilityController = DoulaServiceAvailabilityController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_availability_dto_1.CreateDoulaServiceAvailabilityDto, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "createAvailability", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, service_availability_dto_1.UpdateDoulaServiceAvailabilityDto]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Post)("doula/off-days"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [off_days_dto_1.CreateDoulaOffDaysDto, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "createOffDays", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)("doula/off-days"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "getOffDays", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('doula/off-days/:id'),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "getOffdaysbyId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Patch)('doula/off-days/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, off_days_dto_1.UpdateDoulaOffDaysDto, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "updateOffdays", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Delete)('doula/off-days/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "removeOffdays", null);
exports.DoulaServiceAvailabilityController = DoulaServiceAvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('Doula Service Availability'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.Controller)({
        path: 'service/availability',
        version: '1',
    }),
    __metadata("design:paramtypes", [service_availability_service_1.DoulaServiceAvailabilityService])
], DoulaServiceAvailabilityController);
//# sourceMappingURL=service-availability.controller.js.map