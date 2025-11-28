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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoulaController = void 0;
const common_1 = require("@nestjs/common");
const doula_service_1 = require("./doula.service");
const create_doula_dto_1 = require("./dto/create-doula.dto");
const update_doula_dto_1 = require("./dto/update-doula.dto");
const update_doula_status_dto_1 = require("./dto/update-doula-status.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
let DoulaController = class DoulaController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto, req) {
        return this.service.create(dto, req.user.id);
    }
    async get(page = 1, limit = 10, search) {
        return this.service.get(Number(page), Number(limit), search);
    }
    async getById(id) {
        return this.service.getById(id);
    }
    async delete(id) {
        return this.service.delete(id);
    }
    async updateStatus(id, body) {
        return this.service.updateStatus(id, body.isActive);
    }
    async updateRegions(dto, req) {
        return this.service.UpdateDoulaRegions(dto, req.user.id);
    }
};
exports.DoulaController = DoulaController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'ZONE_MANAGER'),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Doula' }),
    (0, swagger_1.ApiBody)({ type: create_doula_dto_1.CreateDoulaDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doula created successfully',
                data: {
                    id: 'doula-uuid',
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    phone: '+919876543210',
                    regionIds: ['region-uuid-1', 'region-uuid-2']
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_doula_dto_1.CreateDoulaDto, Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Doulas with pagination & search' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doulas fetched',
                data: {
                    items: [
                        { id: 'doula-1', name: 'Jane', email: 'jane@example.com' },
                        { id: 'doula-2', name: 'Asha', email: 'asha@example.com' }
                    ],
                    total: 2,
                    page: 1,
                    limit: 10
                }
            }
        }
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a Doula by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', required: true, description: 'Doula UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doula fetched',
                data: {
                    id: 'doula-uuid',
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    phone: '+919876543210',
                    regions: [{ id: 'region-1', name: 'Region A' }]
                }
            }
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'ZONE_MANAGER'),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a Doula' }),
    (0, swagger_1.ApiParam)({ name: 'id', required: true, description: 'Doula UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: { success: true, message: 'Doula deleted', data: null }
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'ZONE_MANAGER'),
    (0, common_1.Patch)(':id/update/status/'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Doula status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Doula ID' }),
    (0, swagger_1.ApiBody)({ type: update_doula_status_dto_1.UpdateDoulaStatusDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: { success: true, message: 'Status updated', data: { id: 'doula-uuid', isActive: true } }
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof update_doula_status_dto_1.UpdateDoulaStatusDto !== "undefined" && update_doula_status_dto_1.UpdateDoulaStatusDto) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'ZONE_MANAGER'),
    (0, common_1.Patch)('update/regions'),
    (0, swagger_1.ApiOperation)({ summary: 'Add or remove regions from a Doula' }),
    (0, swagger_1.ApiBody)({ type: update_doula_dto_1.UpdateDoulaRegionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doula regions updated',
                data: { profileId: 'profile-uuid', regionIds: ['r1', 'r2'], purpose: 'add' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_doula_dto_1.UpdateDoulaRegionDto, Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "updateRegions", null);
exports.DoulaController = DoulaController = __decorate([
    (0, swagger_1.ApiTags)('Doula'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.Controller)({
        path: 'doula',
        version: '1',
    }),
    __metadata("design:paramtypes", [doula_service_1.DoulaService])
], DoulaController);
//# sourceMappingURL=doula.controller.js.map