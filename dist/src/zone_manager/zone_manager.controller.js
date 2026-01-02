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
const update_doula_dto_1 = require("../doula/dto/update-doula.dto");
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
function multerStoragedoula() {
    return (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            cb(null, './uploads/doulas');
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
    async getSchedules(req, page, limit, status, search, date) {
        return this.service.getZoneManagerSchedules(req.user.id, Number(page) || 1, Number(limit) || 10, {
            status,
            search,
            date,
        });
    }
    async getBookedServices(req, page, limit, search, status, startDate, endDate) {
        return this.service.getZoneManagerBookedServices(req.user.id, Number(page) || 1, Number(limit) || 10, {
            search,
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
    async getDoulasUnderZm(req) {
        return this.service.getDoulasUnderZm(req.user.id);
    }
    async addGalleryImages(req, files, doulaId) {
        return this.service.addDoulaGalleryImages(doulaId, files, req.user.id);
    }
    async getGalleryImages(req, doulaId) {
        return this.service.getDoulaGalleryImages(doulaId, req.user.id);
    }
    async deleteGalleryImage(req, imageId, doulaId) {
        return this.service.deleteDoulaGalleryImage(doulaId, imageId, req.user.id);
    }
    async updateDoulaProfile(req, dto, doulaId) {
        return this.service.updateDoulaProfile(doulaId, dto, req.user.id);
    }
    async recentActivity(req) {
        const userId = req.user.id;
        return {
            status: 'success',
            message: 'Recent activity fetched',
            data: await this.service.recentActivityForZoneManager(userId),
        };
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
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                "status": "success",
                "message": "Zone Manager created successfully",
                "data": {
                    "id": "386acafc-f7f0-4ad8-887a-9120d94cc4ae",
                    "name": "devanand",
                    "email": "devvv@gmail.com",
                    "phone": "+918921236345",
                    "otp": null,
                    "otpExpiresAt": null,
                    "role": "ZONE_MANAGER",
                    "is_active": true,
                    "createdAt": "2025-12-03T09:59:07.066Z",
                    "updatedAt": "2025-12-03T09:59:07.066Z",
                    "zonemanagerprofile": {
                        "id": "3aa1427e-90f2-4dc2-95c3-890690e3f857",
                        "userId": "386acafc-f7f0-4ad8-887a-9120d94cc4ae",
                        "profile_image": "uploads/manager/1764755947060-99108560.png",
                        "createdAt": "2025-12-03T09:59:07.066Z",
                        "updatedAt": "2025-12-03T09:59:07.066Z"
                    }
                }
            }
        },
    }),
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
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Zone Managers fetched successfully",
                "data": [
                    {
                        "userId": "55f12bf3-317f-4157-8aa0-0d979e3e8fa7",
                        "name": "Adam Smith",
                        "email": "zonemanager@test.com",
                        "phone": "+918843488338",
                        "role": "ZONE_MANAGER",
                        "is_active": true,
                        "profileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
                        "regions": [
                            "North Mumbai"
                        ],
                        "doulas": [
                            "Anita Sharma"
                        ]
                    }
                ],
                "meta": {
                    "total": 1,
                    "page": 1,
                    "limit": 1,
                    "totalPages": 1,
                    "hasNextPage": false,
                    "hasPrevPage": false
                }
            }
        }
    }),
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
                "status": "success",
                "message": "Zone Manager fetched successfully",
                "data": {
                    "userId": "55f12bf3-317f-4157-8aa0-0d979e3e8fa7",
                    "name": "Adam Smith",
                    "email": "zonemanager@test.com",
                    "phone": "+918843488338",
                    "role": "ZONE_MANAGER",
                    "is_active": true,
                    "profileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
                    "regions": [
                        {
                            "id": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
                            "regionName": "North Mumbai",
                            "pincode": "4999022",
                            "district": "Mumbai Suburban",
                            "state": "Maharashtra",
                            "country": "India",
                            "latitude": "19.1136",
                            "longitude": "72.8697",
                            "is_active": true
                        }
                    ],
                    "doulas": [
                        {
                            "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                            "userId": "a0f185ed-8c28-4316-ac07-dbdc7dce8f38",
                            "name": "Anita Sharma",
                            "email": "doula@test.com",
                            "phone": "+919876543342",
                            "is_active": true,
                            "description": "Certified birth doula with 6+ years of experience",
                            "qualification": "Certified Birth Doula (CBD)",
                            "achievements": "Supported 300+ successful births",
                            "yoe": 6,
                            "languages": [
                                "English",
                                "Hindi",
                                "Tamil"
                            ],
                            "regions": [
                                {
                                    "id": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
                                    "regionName": "North Mumbai",
                                    "pincode": "4999022",
                                    "district": "Mumbai Suburban",
                                    "state": "Maharashtra",
                                    "country": "India"
                                }
                            ]
                        }
                    ]
                }
            }
        },
    }),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "message": "Zone Manager not found",
                "error": "Not Found",
                "statusCode": 404
            }
        }
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
                "status": "success",
                "message": "Zone Manager deleted successfully",
                "data": {
                    "message": "Zone Manager deleted successfully",
                    "data": null
                }
            }
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
                "status": "success",
                "message": "Zone Manager status updated successfully",
                "data": {
                    "id": "9f9bc3d6-05fc-4f1f-b5b3-d9a07117bff7",
                    "name": "Jane Doe",
                    "email": "zonemanager@gmail.com",
                    "phone": "+911234567891",
                    "otp": null,
                    "otpExpiresAt": null,
                    "role": "ZONE_MANAGER",
                    "is_active": false,
                    "createdAt": "2025-11-25T14:25:31.492Z",
                    "updatedAt": "2025-11-25T14:25:44.676Z"
                }
            }
        },
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
                "profileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
                "regionIds": [
                    "3ffb3715-0f31-47cb-b2a8-d62bb36f2ce9"
                ],
                "purpose": "add"
            }
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Region successfully assigned',
        schema: {
            example: {
                "status": "success",
                "message": "1 Region(s) successfully assigned to Manager",
                "data": {
                    "message": "1 Region(s) successfully assigned to Manager"
                }
            }
        },
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
                "status": "success",
                "message": "Region assignment status fetched",
                "data": {
                    "message": "Region assignment status fetched",
                    "assignedCount": 2,
                    "unassignedCount": 0,
                    "assigned": [
                        {
                            "id": "3ffb3715-0f31-47cb-b2a8-d62bb36f2ce9",
                            "regionName": "Texas",
                            "zoneManagerId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50"
                        },
                        {
                            "id": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
                            "regionName": "North Mumbai",
                            "zoneManagerId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50"
                        }
                    ],
                    "unassigned": []
                }
            }
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
    (0, swagger_1.ApiOperation)({ description: "Fetch All Service Schedules that fall under Zone Manager" }),
    (0, swagger_1.ApiBearerAuth)("acccess-token"),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false }),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Schedules fetched successfully",
                "data": [
                    {
                        "scheduleId": "192aec93-cf39-4aa2-a906-43795aea485e",
                        "clientId": "43d9b6d3-727c-4e09-9b0d-42b6c231ee70",
                        "clientName": "shambu",
                        "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                        "doulaName": "Anita Sharma",
                        "serviceName": "Post Partum Doula",
                        "startDate": "NIGHT",
                        "status": "PENDING"
                    },
                    {
                        "scheduleId": "4fc39667-aa82-4b53-80c6-8dca2ddfd2ea",
                        "clientId": "43d9b6d3-727c-4e09-9b0d-42b6c231ee70",
                        "clientName": "shambu",
                        "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                        "doulaName": "Anita Sharma",
                        "serviceName": "Post Partum Doula",
                        "startDate": "NIGHT",
                        "status": "PENDING"
                    }
                ],
                "meta": {
                    "total": 54,
                    "page": 1,
                    "limit": 2,
                    "totalPages": 27,
                    "hasNextPage": true,
                    "hasPrevPage": false
                }
            }
        }
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('schedules/list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getSchedules", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Fetch All Service Bookings that fall under Zone Manager" }),
    (0, swagger_1.ApiBearerAuth)("acccess-token"),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Booked services fetched successfully",
                "data": [
                    {
                        "bookingId": "c2c68373-954b-4c15-b11c-232ee92a5968",
                        "clientId": "6af732ef-8b4a-4097-98fb-ff0fa165afff",
                        "clientName": "test client",
                        "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                        "doulaName": "Anita Sharma",
                        "servicePricingId": "f00e2a99-b097-4c3c-9783-75d5d09ba497",
                        "serviceName": "Birth Doula",
                        "startDate": "2042-09-01T00:00:00.000Z",
                        "endDate": "2042-10-31T00:00:00.000Z",
                        "status": "ACTIVE"
                    }
                ],
                "meta": {
                    "total": 10,
                    "page": 1,
                    "limit": 1,
                    "totalPages": 10,
                    "hasNextPage": true,
                    "hasPrevPage": false
                }
            }
        }
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('booked-services/list'),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getBookedServices", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Fetch All Meetings that fall under Zone Manager" }),
    (0, swagger_1.ApiBearerAuth)("acccess-token"),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Zone manager meetings fetched successfully",
                "data": [
                    {
                        "meetingId": "dfb37e07-08cb-4da2-8224-e990b7a22da1",
                        "clientId": "235248e1-c73a-44d6-b82b-4456a8485010",
                        "clientName": "fayazbroz",
                        "doulaId": null,
                        "doulaName": null,
                        "servicePricingId": null,
                        "serviceName": "Birth Doula",
                        "startDate": "1970-01-01T03:30:00.000Z",
                        "endDate": "1970-01-01T04:00:00.000Z",
                        "status": "SCHEDULED"
                    }
                ],
                "meta": {
                    "total": 1,
                    "page": 1,
                    "limit": 10,
                    "totalPages": 1,
                    "hasNextPage": false,
                    "hasPrevPage": false
                }
            }
        }
    }),
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
    (0, swagger_1.ApiOperation)({ description: "Retrieve each Schedules using uuid" }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Schedule fetched successfully",
                "data": {
                    "scheduleId": "192aec93-cf39-4aa2-a906-43795aea485e",
                    "clientId": "43d9b6d3-727c-4e09-9b0d-42b6c231ee70",
                    "clientName": "shambu",
                    "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                    "doulaName": "Anita Sharma",
                    "serviceName": "Post Partum Doula",
                    "startDate": "NIGHT",
                    "status": "PENDING"
                }
            }
        }
    }),
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
    (0, swagger_1.ApiOperation)({ description: "Retrieve each Bookings using uuid" }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Booked service fetched successfully",
                "data": {
                    "serviceBookingId": "c2c68373-954b-4c15-b11c-232ee92a5968",
                    "clientId": "6af732ef-8b4a-4097-98fb-ff0fa165afff",
                    "clientName": "test client",
                    "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                    "doulaName": "Anita de Asam",
                    "servicePricingId": "f00e2a99-b097-4c3c-9783-75d5d09ba497",
                    "serviceName": "Birth Doula",
                    "startDate": "2042-09-01T00:00:00.000Z",
                    "endDate": "2042-10-31T00:00:00.000Z",
                    "status": "ACTIVE"
                }
            }
        }
    }),
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
    (0, swagger_1.ApiOperation)({ description: "Retrieve each Meetings using uuid" }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Meeting fetched successfully",
                "data": {
                    "meetingId": "dfb37e07-08cb-4da2-8224-e990b7a22da1",
                    "clientId": "235248e1-c73a-44d6-b82b-4456a8485010",
                    "clientName": "fayazbroz",
                    "doulaId": null,
                    "doulaName": null,
                    "servicePricingId": null,
                    "serviceName": "Birth Doula",
                    "startDate": "1970-01-01T03:30:00.000Z",
                    "endDate": "1970-01-01T04:00:00.000Z",
                    "status": "SCHEDULED"
                }
            }
        }
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('meetings/list/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getMeetingById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Fetch all Doulas under Zone Manager" }),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Doulas fetched successfully",
                "data": [
                    {
                        "userId": "a0f185ed-8c28-4316-ac07-dbdc7dce8f38",
                        "profileid": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                        "name": "Anita de Asam",
                        "email": "doula@test.com",
                        "phone": "+919876543342",
                        "yoe": 2,
                        "qualification": "",
                        "languages": [],
                        "specialities": [],
                        "profileImage": "uploads/doulas/1767154501903-168020899.png"
                    }
                ]
            }
        }
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('doulas/list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getDoulasUnderZm", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload doula gallery images' }),
    (0, swagger_1.ApiQuery)({
        name: 'doulaId',
        required: true,
        description: 'Doula profile ID',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Gallery images (max 10)',
                },
            },
            required: ['files'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Gallery images uploaded successfully",
                "data": [
                    {
                        "id": "040170b7-688a-4058-adb5-0fcc83a2cfa2",
                        "url": "uploads/doulas/1766572517976-31374491.png",
                        "altText": null,
                        "createdAt": "2025-12-24T10:35:17.983Z"
                    },
                    {
                        "id": "6117a362-f8d4-452a-9728-7ca16dcb24fc",
                        "url": "uploads/doulas/1766572517972-331472083.png",
                        "altText": null,
                        "createdAt": "2025-12-24T10:35:17.983Z"
                    }
                ]
            }
        }
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Post)('doulas/gallery/images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: multerStoragedoula(),
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: (req, file, cb) => {
            if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Unsupported file type'), false);
            }
        },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Query)('doulaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "addGalleryImages", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch Doula Gallery Images' }),
    (0, swagger_1.ApiQuery)({
        name: 'doulaId',
        required: true,
        description: 'Doula UserID',
    }),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Doula gallery images fetched successfully",
                "data": [
                    {
                        "id": "003dd08a-fb13-4a2d-a004-76ffe49a5dfc",
                        "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                        "url": "uploads/doulas/1767154479162-382266985.png",
                        "altText": null,
                        "createdAt": "2025-12-31T04:14:39.180Z"
                    },
                    {
                        "id": "97c0e4c8-54c5-4f72-8120-86803a4a9592",
                        "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                        "url": "uploads/doulas/1767154479164-287555438.png",
                        "altText": null,
                        "createdAt": "2025-12-31T04:14:39.180Z"
                    },
                    {
                        "id": "57c4ba33-5029-4123-8051-ddfa6aad2b06",
                        "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                        "url": "uploads/doulas/1767165269144-747759397.jpeg",
                        "altText": null,
                        "createdAt": "2025-12-31T07:14:29.154Z"
                    }
                ]
            }
        }
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('doulas/gallery/images/'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('doulaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "getGalleryImages", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Fetch Doula Gallery Images' }),
    (0, swagger_1.ApiQuery)({
        name: 'doulaId',
        required: true,
        description: 'Doula UserID',
    }),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Gallery image deleted successfully",
                "data": {
                    "message": "Gallery image deleted successfully"
                }
            }
        }
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Delete)('doulas/gallery/images/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('doulaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "deleteGalleryImage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update Doula Profile as Zone Manager' }),
    (0, swagger_1.ApiQuery)({
        name: 'doulaId',
        required: true,
        description: 'Doula UserID',
    }),
    (0, swagger_1.ApiBody)({ type: update_doula_dto_1.UpdateDoulaProfileDto }),
    (0, swagger_1.ApiResponse)({
        schema: {
            example: {
                "status": "success",
                "message": "Doula profile fetched successfully",
                "data": {
                    "id": "01be9f0d-8c08-4091-a0ce-eec44acb063c",
                    "name": "Senior Doula",
                    "title": "Certified Birth Doula",
                    "averageRating": 4.7,
                    "totalReviews": 3,
                    "births": 0,
                    "experience": 6,
                    "satisfaction": 93,
                    "contact": {
                        "email": "doula@test.com",
                        "phone": "9000000005",
                        "location": "Kochi"
                    },
                    "about": "Experienced doula",
                    "certifications": [
                        "Certified"
                    ],
                    "gallery": []
                }
            }
        }
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Patch)('doulas/profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('doulaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_doula_dto_1.UpdateDoulaProfileDto, String]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "updateDoulaProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('recent/activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent activity for zone manager' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recent activity fetched successfully',
        schema: {
            example: {
                status: 'success',
                message: 'Recent activity fetched',
                data: [
                    {
                        id: 'a12b34c5',
                        entityType: 'BOOKING',
                        entityId: 'a12b34c5',
                        action: 'BOOKING_CREATED',
                        title: 'New Booking Created',
                        description: 'Jane Doe booked Anita Sharma',
                        date: '2025-12-31T08:45:21.000Z',
                    },
                    {
                        id: 'm45c98d1',
                        entityType: 'MEETING',
                        entityId: 'm45c98d1',
                        action: 'MEETING_SCHEDULED',
                        title: 'Meeting Scheduled',
                        description: 'Meeting scheduled with Jane Doe',
                        date: '2025-12-31T07:30:00.000Z',
                    },
                ],
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden – not a zone manager' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZoneManagerController.prototype, "recentActivity", null);
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