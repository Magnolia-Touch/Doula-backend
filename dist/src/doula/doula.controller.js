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
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
const platform_express_1 = require("@nestjs/platform-express");
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
function multerStorage() {
    return (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            cb(null, './uploads/doulas');
        },
        filename: (req, file, cb) => {
            const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9) + (0, path_1.extname)(file.originalname);
            cb(null, safeName);
        },
    });
}
let DoulaController = class DoulaController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto, req, files) {
        const images = files?.images ?? [];
        const imagePayload = images.map((file, index) => ({
            url: `uploads/doulas/${file.filename}`,
            isMain: index === 0,
            sortOrder: index,
        }));
        const result = await this.service.create(dto, req.user.id, imagePayload);
        return {
            success: true,
            message: 'Doula created successfully',
            data: result.data,
        };
    }
    async get(page = 1, limit = 10, search, serviceId, isAvailable, isActive, regionName, minExperience, serviceName, startDate, endDate) {
        return this.service.get(Number(page), Number(limit), search, serviceId, isAvailable, isActive, regionName, minExperience ? Number(minExperience) : undefined, serviceName, startDate, endDate);
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
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'images', maxCount: 5 },
    ], {
        storage: multerStorage(),
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: (req, file, cb) => {
            if (ALLOWED_IMAGE_TYPES.includes(file.mimetype))
                cb(null, true);
            else
                cb(new common_1.BadRequestException('Unsupported file type'), false);
        },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_doula_dto_1.CreateDoulaDto, Object, Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all doulas with filters & pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search by name, email, phone, region' }),
    (0, swagger_1.ApiQuery)({ name: 'serviceId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'isAvailable', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'regionName', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'minExperience', required: false, type: Number, description: 'Minimum years of experience' }),
    (0, swagger_1.ApiQuery)({ name: 'serviceName', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'ISO date yyyy-MM-dd' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'ISO date yyyy-MM-dd' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns a filtered & paginated list of doulas'
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('serviceId')),
    __param(4, (0, common_1.Query)('isAvailable')),
    __param(5, (0, common_1.Query)('isActive')),
    __param(6, (0, common_1.Query)('regionName')),
    __param(7, (0, common_1.Query)('minExperience')),
    __param(8, (0, common_1.Query)('serviceName')),
    __param(9, (0, common_1.Query)('startDate')),
    __param(10, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, Boolean, Boolean, String, Number, String, String, String]),
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
    __metadata("design:paramtypes", [String, update_doula_status_dto_1.UpdateDoulaStatusDto]),
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