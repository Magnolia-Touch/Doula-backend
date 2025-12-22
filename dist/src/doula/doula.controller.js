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
const update_doula_region_dto_1 = require("./dto/update-doula-region.dto");
const update_doula_status_dto_1 = require("./dto/update-doula-status.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
const platform_express_1 = require("@nestjs/platform-express");
const client_1 = require("@prisma/client");
const update_doula_dto_1 = require("./dto/update-doula.dto");
const certificate_dto_1 = require("./dto/certificate.dto");
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
        const images = files?.gallery_image ?? [];
        const profileImage = files?.profile_image?.[0];
        let profileImageUrl;
        if (profileImage) {
            if (!ALLOWED_IMAGE_TYPES.includes(profileImage.mimetype)) {
                throw new common_1.BadRequestException('Unsupported image type.');
            }
            if (profileImage.size > MAX_FILE_SIZE) {
                throw new common_1.BadRequestException('Profile image exceeds maximum size of 5 MB.');
            }
            profileImageUrl = `uploads/doulas/${profileImage.filename}`;
        }
        const imagePayload = images.map((file, index) => ({
            url: `uploads/doulas/${file.filename}`,
        }));
        const result = await this.service.create(dto, req.user.id, imagePayload, profileImageUrl);
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
    async getDoulaMeetings(req, date, page = '1', limit = '10') {
        return this.service.getDoulaMeetings(req.user, Number(page), Number(limit), date);
    }
    async getDoulaMeetingDetail(req, meetingId) {
        return this.service.getDoulaMeetingDetail(req.user, meetingId);
    }
    async getDoulaSchedules(req, date, page = '1', limit = '10') {
        return this.service.getDoulaSchedules(req.user, Number(page), Number(limit), date);
    }
    async getDoulaScheduleDetail(req, scheduleId) {
        return this.service.getDoulaScheduleDetail(req.user, scheduleId);
    }
    async getDoulaScheduleCount(req) {
        return this.service.getDoulaScheduleCount(req.user);
    }
    async getImmediateMeeting(req) {
        return this.service.ImmediateMeeting(req.user);
    }
    async getRatingSummary(req) {
        return this.service.getDoulaRatingSummary(req.user);
    }
    async getDoulaTestimonials(req, page = '1', limit = '10') {
        return this.service.getDoulaTestimonials(req.user, Number(page), Number(limit));
    }
    async getDoulaProfile(req) {
        return this.service.doulaProfile(req.user);
    }
    async uploadDoulaImage(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('Profile image is required');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException('Profile image exceeds maximum size of 5 MB.');
        }
        const profileImageUrl = `uploads/doulas/${file.filename}`;
        return this.service.addDoulaprofileImage(req.user.id, profileImageUrl);
    }
    async getDoulaImages(req) {
        return this.service.getDoulaImages(req.user.id);
    }
    async deleteDoulaImage(req) {
        return this.service.deleteDoulaprofileImage(req.user.id);
    }
    async addGalleryImages(req, files, altText) {
        return this.service.addDoulaGalleryImages(req.user.id, files, altText);
    }
    async getGalleryImages(req) {
        return this.service.getDoulaGalleryImages(req.user.id);
    }
    async deleteGalleryImage(req, imageId) {
        return this.service.deleteDoulaGalleryImage(req.user.id, imageId);
    }
    async updateDoulaProfile(req, dto) {
        return this.service.updateDoulaProfile(req.user.id, dto);
    }
    async getCertificates(req) {
        return this.service.getCertificates(req.user.id);
    }
    async getCertificateById(req, certificateId) {
        return this.service.getCertificateById(req.user.id, certificateId);
    }
    async updateCertificate(req, certificateId, dto) {
        return this.service.updateCertificate(req.user.id, certificateId, dto);
    }
    async deleteCertificate(req, certificateId) {
        return this.service.deleteCertificate(req.user.id, certificateId);
    }
    async getServiceBookings(req, date, page = '1', limit = '10') {
        return this.service.getServiceBookings(req.user.id, Number(page), Number(limit));
    }
    async getServiceBookingsinDetail(req, serviceBookingId) {
        console.log(serviceBookingId);
        return this.service.getServiceBookingsinDetail(req.user.id, serviceBookingId);
    }
};
exports.DoulaController = DoulaController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'ZONE_MANAGER'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
    })),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'profile_image', maxCount: 1 },
        { name: 'gallery_image', maxCount: 5 }
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
    (0, swagger_1.ApiBody)({ type: update_doula_region_dto_1.UpdateDoulaRegionDto }),
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
    __metadata("design:paramtypes", [update_doula_region_dto_1.UpdateDoulaRegionDto, Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "updateRegions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/meetings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Meetings of Doula' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, example: '2025-01-20' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                success: true,
                message: 'Doula meetings fetched successfully',
                data: [
                    {
                        date: '2025-01-20T00:00:00.000Z',
                        serviceName: 'Postnatal Consultation',
                        clientName: 'Anita Joseph',
                    },
                ],
                meta: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getDoulaMeetings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/meetings/:meetingId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('meetingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getDoulaMeetingDetail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/schedules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get schedules of logged-in doula' }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        required: false,
        example: '2025-01-20',
        description: 'Fetch schedules on a specific date (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        example: 10,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                success: true,
                message: 'Doula schedules fetched successfully',
                data: [
                    {
                        startTime: '2025-01-20T09:00:00.000Z',
                        endTime: '2025-01-20T10:00:00.000Z',
                        serviceName: 'Postnatal Consultation',
                        clientName: 'Anita Joseph',
                    },
                ],
                meta: {
                    total: 5,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getDoulaSchedules", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/schedules/:scheduleId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('scheduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getDoulaScheduleDetail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/schedules/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get today and weekly schedule count for doula' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                success: true,
                message: 'Doula schedule counts fetched successfully',
                data: {
                    today: 2,
                    thisWeek: 7,
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getDoulaScheduleCount", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/meetings/immediate'),
    (0, swagger_1.ApiOperation)({ summary: 'Get next immediate meeting for doula dashboard' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                success: true,
                message: 'Immediate meeting fetched successfully',
                data: {
                    clientName: 'Sarah Johnson',
                    serviceName: 'Prenatal Consultation',
                    startTime: '2025-01-20T10:00:00.000Z',
                    timeToStart: 'in 30 mins',
                    meetingLink: 'https://meet.example.com/abc123',
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getImmediateMeeting", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/ratings/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get doula rating summary' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                success: true,
                message: 'Doula rating summary fetched successfully',
                data: {
                    averageRating: 4.8,
                    totalReviews: 5,
                    distribution: {
                        5: 4,
                        4: 1,
                        3: 0,
                        2: 0,
                        1: 0,
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getRatingSummary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/testimonials'),
    (0, swagger_1.ApiOperation)({ summary: 'Get testimonials associated with the logged-in doula' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                success: true,
                message: 'Doula testimonials fetched successfully',
                data: [
                    {
                        clientId: 'client-uuid',
                        clientName: 'Sarah Johnson',
                        email: 'sarah@example.com',
                        phone: '9876543210',
                        ratings: 5,
                        reviews: 'Very supportive and professional.',
                        createdAt: '2025-01-18T08:30:00.000Z',
                        serviceName: 'Prenatal Consultation',
                    },
                ],
                meta: {
                    total: 5,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getDoulaTestimonials", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get logged-in doula profile details' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                success: true,
                message: 'Doula profile fetched successfully',
                data: {
                    id: 'doula-uuid',
                    name: 'Jane Doe',
                    title: 'Certified Birth Doula',
                    averageRating: 4.9,
                    totalReviews: 156,
                    births: 156,
                    experience: 8,
                    satisfaction: 98,
                    contact: {
                        email: 'jane.doe@doula.com',
                        phone: '5551234567',
                        location: 'San Francisco, CA',
                    },
                    about: 'I am a passionate birth doula with over 8 years of experience...',
                    certifications: [
                        'Certified Birth Doula',
                        'Childbirth Educator',
                        'Lactation Counselor',
                        'CPR & First Aid',
                    ],
                    gallery: [
                        {
                            id: 'img-uuid',
                            url: 'https://cdn.app.com/img1.jpg',
                            altText: 'Session photo',
                        },
                    ],
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getDoulaProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Post)('profile/images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profile_image', {
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
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "uploadDoulaImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('profile/images'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getDoulaImages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Delete)('profile/images/'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "deleteDoulaImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Post)('gallery/images'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: multerStorage(),
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
    __param(2, (0, common_1.Body)('altText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "addGalleryImages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('gallery/images/'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getGalleryImages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Delete)('gallery/images/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "deleteGalleryImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Patch)('app/profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_doula_dto_1.UpdateDoulaProfileDto]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "updateDoulaProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)("list/certificates"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getCertificates", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('list/certificates/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getCertificateById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Patch)('list/certificates/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, certificate_dto_1.UpdateCertificateDto]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "updateCertificate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Delete)('list/certificates/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "deleteCertificate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/service-bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booked services of logged-in doula' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getServiceBookings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Get)('app/service-bookings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booked services of logged-in doula' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DoulaController.prototype, "getServiceBookingsinDetail", null);
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