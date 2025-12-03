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
exports.RegionController = void 0;
const common_1 = require("@nestjs/common");
const regions_service_1 = require("./regions.service");
const regions_dto_1 = require("./dto/regions.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
let RegionController = class RegionController {
    regionService;
    constructor(regionService) {
        this.regionService = regionService;
    }
    create(dto) {
        return this.regionService.create(dto);
    }
    findAll(page = 1, limit = 10, search) {
        return this.regionService.findAll(+page, +limit, search);
    }
    findOne(id) {
        return this.regionService.findOne(id);
    }
    update(id, dto) {
        return this.regionService.update(id, dto);
    }
    remove(id) {
        return this.regionService.remove(id);
    }
};
exports.RegionController = RegionController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a region' }),
    (0, swagger_1.ApiBody)({ type: regions_dto_1.CreateRegionDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Region created',
                data: {
                    id: 'region-1',
                    regionName: 'South City',
                    pincode: '560001',
                    district: 'Bengaluru',
                    state: 'Karnataka',
                    country: 'India',
                },
            },
        },
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [regions_dto_1.CreateRegionDto]),
    __metadata("design:returntype", void 0)
], RegionController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all regions (paginated & searchable)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Regions fetched',
                data: {
                    items: [
                        {
                            id: 'region-1',
                            regionName: 'South City',
                            pincode: '560001',
                            district: 'Bengaluru',
                            state: 'Karnataka',
                            country: 'India',
                        },
                    ],
                    total: 1,
                    page: 1,
                    limit: 10,
                },
            },
        },
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], RegionController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get region by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: { example: { success: true, message: 'Region fetched', data: { id: 'region-1', regionName: 'South City' } } },
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegionController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'ZONE_MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Update region' }),
    (0, swagger_1.ApiBody)({ type: regions_dto_1.UpdateRegionDto }),
    (0, swagger_1.ApiResponse)({ status: 200, type: swagger_response_dto_1.SwaggerResponseDto, schema: { example: { success: true, message: 'Region updated', data: { id: 'region-1' } } } }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, regions_dto_1.UpdateRegionDto]),
    __metadata("design:returntype", void 0)
], RegionController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'ZONE_MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete region' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: swagger_response_dto_1.SwaggerResponseDto, schema: { example: { success: true, message: 'Region deleted', data: null } } }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegionController.prototype, "remove", null);
exports.RegionController = RegionController = __decorate([
    (0, swagger_1.ApiTags)('Regions'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.Controller)({
        path: 'regions',
        version: '1',
    }),
    __metadata("design:paramtypes", [regions_service_1.RegionService])
], RegionController);
//# sourceMappingURL=regions.controller.js.map