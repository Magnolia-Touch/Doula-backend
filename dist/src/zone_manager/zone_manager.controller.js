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
exports.ZoneManagerController = void 0;
const common_1 = require("@nestjs/common");
const zone_manager_service_1 = require("./zone_manager.service");
const create_zone_manager_dto_1 = require("./dto/create-zone-manager.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const update_zone_manager_dto_1 = require("./dto/update-zone-manager.dto");
let ZoneManagerController = class ZoneManagerController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    getZoneManagers(page = 1, limit = 3, search) {
        return this.service.get(Number(page), Number(limit), search);
    }
    async getZoneManagerById(id) {
        return this.service.getById(id);
    }
    async delete(id) {
        return this.service.delete(id);
    }
    async UpdateManagerStatus(id, isActive) {
        return this.service.updateStatus(id, isActive);
    }
    async assignRegionToManager(dto) {
        return this.service.UpdateZoneManagerRegions(dto);
    }
    async regionAlreadyAssignedOrNot(dto) {
        return this.service.regionAlreadyAssignedOrNot(dto.regionIds);
    }
};
exports.ZoneManagerController = ZoneManagerController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create Zone Manager' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_zone_manager_dto_1.CreateZoneManagerDto]),
    __metadata("design:returntype", void 0)
], ZoneManagerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get zone managers list' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], ZoneManagerController.prototype, "getZoneManagers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Zone Manager by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
        description: 'UUID of the Zone Manager',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Zone Manager fetched successfully.',
        schema: {
            example: {
                message: 'Zone Manager fetched successfully',
                data: {
                    id: '87c0aaee-b4f8-4d62-b0bc-72246ff312ab',
                    name: 'John Doe',
                    email: 'john@gmail.com',
                    role: 'ZONE_MANAGER',
                    zonemanagerprofile: {
                        id: 'ec25d03a-dba5-43d3-b56e-7a546ec2da9f',
                        region: 'North Zone',
                        phone: '9876543210',
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Zone Manager not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getZoneManagerById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Zone Manager' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
        description: 'UUID of the Zone Manager',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Zone Manager Deleted successfully.',
        schema: {
            example: {
                message: 'Zone Manager Deleted successfully',
                data: {
                    id: '87c0aaee-b4f8-4d62-b0bc-72246ff312ab',
                    name: 'John Doe',
                    email: 'john@gmail.com',
                    role: 'ZONE_MANAGER',
                    zonemanagerprofile: {
                        id: 'ec25d03a-dba5-43d3-b56e-7a546ec2da9f',
                        region: 'North Zone',
                        phone: '9876543210',
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Zone Manager not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)(({ summary: "Update Status of Zone Manager" })),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
        description: 'UUID of the Zone Manager',
        required: true,
    }),
    (0, swagger_1.ApiBody)({
        description: 'Status update payload',
        schema: {
            example: {
                isActive: true,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Zone Manager status updated successfully',
        schema: {
            example: {
                message: 'Zone Manager status updated successfully',
                data: {
                    id: '3fd8c6b4-74db-4b3e-afdd-fa3a77c7465e',
                    name: 'John Doe',
                    email: 'john@gmail.com',
                    role: 'ZONE_MANAGER',
                    is_active: true,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Zone Manager not found',
    }),
    (0, common_1.Patch)(':id/update/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "UpdateManagerStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Patch)('assign/region'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a Region to a Zone Manager' }),
    (0, swagger_1.ApiBody)({
        type: update_zone_manager_dto_1.UpdateZoneManagerRegionDto,
        description: 'Provide Zone Manager Profile ID and Region ID',
        schema: {
            example: {
                profileId: '4cb9ddc3-4766-46be-86a7-7c5bdf1b82d5',
                regionId: '96efbdce-d7cb-43bb-8787-626c198be1a4',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Region successfully assigned',
        schema: {
            example: {
                message: 'Region successfully Assigned',
                data: {
                    id: '96efbdce-d7cb-43bb-8787-626c198be1a4',
                    regionName: 'Bangalore West',
                    district: 'Bangalore',
                    state: 'Karnataka',
                    country: 'India',
                    zoneManagerId: '4cb9ddc3-4766-46be-86a7-7c5bdf1b82d5',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Zone Manager Profile or Region not found',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_zone_manager_dto_1.UpdateZoneManagerRegionDto]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "assignRegionToManager", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)("region/assignment-status"),
    (0, swagger_1.ApiOperation)({ summary: "Check whether regions are already assigned to a Zone Manager" }),
    (0, swagger_1.ApiBody)({ type: update_zone_manager_dto_1.RegionAssignmentCheckDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Region assignment status fetched",
        schema: {
            example: {
                message: "Region assignment status fetched",
                assignedCount: 1,
                unassignedCount: 1,
                assigned: [
                    {
                        id: "96efbdce-d7cb-43bb-8787-626c198be1a4",
                        regionName: "Bangalore East",
                        zoneManagerId: "9e9c77fa-2cd4-4d92-b7cb-4f6851f1f3a8"
                    }
                ],
                unassigned: [
                    {
                        id: "4fd68b32-cb85-4f8b-9375-d4477dc7c3ae",
                        regionName: "Chennai North",
                        zoneManagerId: null
                    }
                ]
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "One or more region IDs are invalid" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_zone_manager_dto_1.RegionAssignmentCheckDto]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "regionAlreadyAssignedOrNot", null);
exports.ZoneManagerController = ZoneManagerController = __decorate([
    (0, swagger_1.ApiTags)('Zone Managers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)({
        path: 'zonemanager',
        version: '1',
    }),
    __metadata("design:paramtypes", [zone_manager_service_1.ZoneManagerService])
], ZoneManagerController);
//# sourceMappingURL=zone_manager.controller.js.map