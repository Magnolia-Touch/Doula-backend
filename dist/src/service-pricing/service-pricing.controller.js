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
exports.ServicePricingController = void 0;
const common_1 = require("@nestjs/common");
const service_pricing_service_1 = require("./service-pricing.service");
const service_pricing_dto_1 = require("./dto/service-pricing.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let ServicePricingController = class ServicePricingController {
    servicesService;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    create(dto, req) {
        const user = req.user.id;
        return this.servicesService.create(dto, user);
    }
    findAll(req) {
        const user = req.user.id;
        return this.servicesService.findAll(user);
    }
    findOne(id) {
        return this.servicesService.findOne(id);
    }
    update(id, dto) {
        return this.servicesService.update(id, dto);
    }
    remove(id) {
        return this.servicesService.remove(id);
    }
    getServiceWithPricing(query) {
        return this.servicesService.listServices(query);
    }
    createPricing(dto) {
        return this.servicesService.createPricing(dto);
    }
};
exports.ServicePricingController = ServicePricingController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a service pricing entry' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Service pricing created successfully',
        schema: {
            example: {
                message: 'Created successfully',
                data: {
                    id: 'uuid',
                    serviceId: 'uuid',
                    price: 4999,
                    createdAt: '2025-01-12T10:12:00.123Z',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_pricing_dto_1.CreateServicePricingDto, Object]),
    __metadata("design:returntype", void 0)
], ServicePricingController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all service pricing entries for current doula',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                message: 'Service pricing list',
                data: [
                    {
                        id: 'uuid',
                        serviceId: 'uuid',
                        price: 4999,
                        doulaId: 'uuid',
                    },
                ],
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ServicePricingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service pricing by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 'uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                id: 'uuid',
                serviceId: 'uuid',
                price: 4999,
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicePricingController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update service pricing' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                message: 'Updated successfully',
                updated: {
                    id: 'uuid',
                    serviceId: 'uuid',
                    price: 5999,
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, service_pricing_dto_1.UpdateServicePricingDto]),
    __metadata("design:returntype", void 0)
], ServicePricingController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service pricing' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                message: 'Deleted successfully',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicePricingController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get services and pricing by service name and doula ID',
    }),
    (0, swagger_1.ApiQuery)({ name: 'name', required: true, example: 'Pregnancy Yoga' }),
    (0, swagger_1.ApiQuery)({ name: 'doulaId', required: false, example: 'uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                serviceName: 'Pregnancy Yoga',
                pricings: [
                    {
                        doulaId: 'uuid',
                        price: 4999,
                        serviceId: 'uuid',
                    },
                ],
            },
        },
    }),
    (0, common_1.Get)('all/list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ServicePricingController.prototype, "getServiceWithPricing", null);
__decorate([
    (0, common_1.Post)('manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a service pricing entry' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Service pricing created successfully',
        schema: {
            example: {
                message: 'Created successfully',
                data: {
                    id: 'uuid',
                    serviceId: 'uuid',
                    price: 4999,
                    createdAt: '2025-01-12T10:12:00.123Z',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_pricing_dto_1.CreateServicePricingDto]),
    __metadata("design:returntype", void 0)
], ServicePricingController.prototype, "createPricing", null);
exports.ServicePricingController = ServicePricingController = __decorate([
    (0, swagger_1.ApiTags)('Service Pricing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)({
        path: 'services-pricing',
        version: '1',
    }),
    __metadata("design:paramtypes", [service_pricing_service_1.ServicePricingService])
], ServicePricingController);
//# sourceMappingURL=service-pricing.controller.js.map