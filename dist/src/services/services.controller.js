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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const services_service_1 = require("./services.service");
const create_service_dto_1 = require("./dto/create-service.dto");
const update_service_dto_1 = require("./dto/update-service.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let ServicesController = class ServicesController {
    servicesService;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    create(dto) {
        return this.servicesService.create(dto);
    }
    findAll() {
        return this.servicesService.findAll();
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
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a service' }),
    (0, swagger_1.ApiBody)({
        type: create_service_dto_1.CreateServiceDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Service created',
        schema: {
            example: {
                "status": "success",
                "message": "Request successful",
                "data": {
                    "id": "db2f9c1f-fb54-4a30-a365-7971d37ee6e5",
                    "name": "Birth Doula",
                    "description": "A Birth Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.",
                    "createdAt": "2025-11-27T10:11:20.235Z",
                    "updatedAt": "2025-11-27T10:11:20.235Z"
                }
            }
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all services' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                "status": "success",
                "message": "Request successful",
                "data": [
                    {
                        "id": "26c11b42-417c-4e37-8543-4ef609646718",
                        "name": "Birth Doula",
                        "description": "A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.",
                        "createdAt": "2025-12-27T19:54:43.687Z",
                        "updatedAt": "2025-12-27T19:54:43.687Z"
                    },
                    {
                        "id": "41bb32e6-ae80-4a9c-8cd9-855f98ced1b2",
                        "name": "Post Partum Doula",
                        "description": "A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.",
                        "createdAt": "2025-12-27T19:54:37.168Z",
                        "updatedAt": "2025-12-27T19:54:37.168Z"
                    }
                ]
            }
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                "status": "success",
                "message": "Request successful",
                "data": {
                    "id": "26c11b42-417c-4e37-8543-4ef609646718",
                    "name": "Birth Doula",
                    "description": "A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.",
                    "createdAt": "2025-12-27T19:54:43.687Z",
                    "updatedAt": "2025-12-27T19:54:43.687Z"
                }
            }
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update service' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                "status": "success",
                "message": "Request successful",
                "data": {
                    "id": "26c11b42-417c-4e37-8543-4ef609646718",
                    "name": "Birth Doula",
                    "description": "Birth Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.",
                    "createdAt": "2025-12-27T19:54:43.687Z",
                    "updatedAt": "2025-12-31T04:56:20.466Z"
                }
            }
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                "status": "success",
                "message": "Request successful",
                "data": {
                    "id": "46214841-05a5-45b0-9f04-cb6d2e5869ca",
                    "name": "Post Partdddum Doula",
                    "description": "A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.",
                    "createdAt": "2025-12-31T04:57:22.094Z",
                    "updatedAt": "2025-12-31T04:57:22.094Z"
                }
            }
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "remove", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)('Services'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)({
        path: 'services',
        version: '1',
    }),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
//# sourceMappingURL=services.controller.js.map