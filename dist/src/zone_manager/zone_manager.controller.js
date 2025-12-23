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
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
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
            cb(null, './uploads/manager');
        },
        filename: (req, file, cb) => {
            const safeName = Date.now() +
                '-' +
                Math.round(Math.random() * 1e9) +
                (0, path_1.extname)(file.originalname);
            cb(null, safeName);
        },
    });
}
let ZoneManagerController = class ZoneManagerController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, files) {
        const profileImage = files?.profile_image?.[0];
        let profileImageUrl;
        if (profileImage) {
            if (!ALLOWED_IMAGE_TYPES.includes(profileImage.mimetype)) {
                throw new common_1.BadRequestException('Unsupported image type.');
            }
            if (profileImage.size > MAX_FILE_SIZE) {
                throw new common_1.BadRequestException('Profile image exceeds maximum size of 5 MB.');
            }
            profileImageUrl = `uploads/manager/${profileImage.filename}`;
        }
        return this.service.create(dto, profileImageUrl);
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
    async getSchedules(req, page, limit, status, serviceName, date) {
        return this.service.getZoneManagerSchedules(req.user.id, Number(page) || 1, Number(limit) || 10, {
            status,
            serviceName,
            date,
        });
    }
    async getBookedServices(req, page, limit, serviceName, status, startDate, endDate) {
        return this.service.getZoneManagerBookedServices(req.user.id, Number(page) || 1, Number(limit) || 10, {
            serviceName,
            status,
            startDate,
            endDate,
        });
    }
    async getZoneManagerMeetings(req, page, limit, search, status) {
        return this.service.getZoneManagerMeetings(req.user.id, Number(page) || 1, Number(limit) || 10, search?.trim(), status);
    }
    async getScheduleById(req, id) {
        return this.service.getZoneManagerScheduleById(req.user.id, id);
    }
    async getBookedServiceById(req, id) {
        return this.service.getZoneManagerBookedServiceById(req.user.id, id);
    }
    async getMeetingById(req, id) {
        return this.service.getZoneManagerMeetingById(req.user.id, id);
    }
};
exports.ZoneManagerController = ZoneManagerController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'profile_image', maxCount: 1 }], {
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
    (0, swagger_1.ApiOperation)({ summary: 'Create Zone Manager' }),
    (0, swagger_1.ApiBody)({ type: create_zone_manager_dto_1.CreateZoneManagerDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_zone_manager_dto_1.CreateZoneManagerDto, Object]),
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
    (0, swagger_1.ApiOperation)({ summary: 'Update Status of Zone Manager' }),
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
    (0, common_1.Get)('region/assignment-status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check whether regions are already assigned to a Zone Manager',
    }),
    (0, swagger_1.ApiBody)({ type: update_zone_manager_dto_1.RegionAssignmentCheckDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Region assignment status fetched',
        schema: {
            example: {
                message: 'Region assignment status fetched',
                assignedCount: 1,
                unassignedCount: 1,
                assigned: [
                    {
                        id: '96efbdce-d7cb-43bb-8787-626c198be1a4',
                        regionName: 'Bangalore East',
                        zoneManagerId: '9e9c77fa-2cd4-4d92-b7cb-4f6851f1f3a8',
                    },
                ],
                unassigned: [
                    {
                        id: '4fd68b32-cb85-4f8b-9375-d4477dc7c3ae',
                        regionName: 'Chennai North',
                        zoneManagerId: null,
                    },
                ],
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'One or more region IDs are invalid',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_zone_manager_dto_1.RegionAssignmentCheckDto]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "regionAlreadyAssignedOrNot", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('schedules/list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('serviceName')),
    __param(5, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getSchedules", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('booked-services/list'),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('serviceName')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getBookedServices", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('meetings/list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getZoneManagerMeetings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('schedules/list/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getScheduleById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('booked-services/list/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getBookedServiceById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('meetings/list/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getMeetingById", null);
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