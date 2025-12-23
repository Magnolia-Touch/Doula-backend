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
const service_availability_dto_1 = require("./dto/service-availability.dto");
const swagger_1 = require("@nestjs/swagger");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
let DoulaServiceAvailabilityController = class DoulaServiceAvailabilityController {
    service;
    constructor(service) {
        this.service = service;
    }
    async createSlots(dto, req) {
        return this.service.createAvailability(dto, req.user);
    }
    async getMyAvailabilities(req) {
        return this.service.getMyAvailabilities(req.user.id);
    }
    async getSlotById(id) {
        return this.service.getSlotById(id);
    }
    async updateSlot(dto, id, req) {
        return this.service.updateSlotTimeById(dto, id, req.user.id);
    }
    async deleteSlot(id, req) {
        return this.service.deleteSlots(id, req.user.id);
    }
    async updateSlotTimeByDate(id) {
        return this.service.updateSlotTimeByDate(id);
    }
};
exports.DoulaServiceAvailabilityController = DoulaServiceAvailabilityController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, swagger_1.ApiOperation)({ summary: 'Create doula service availability slots' }),
    (0, swagger_1.ApiBody)({ type: service_availability_dto_1.CreateDoulaServiceAvailability, isArray: true }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Availability created',
                data: [
                    {
                        id: 'date-avail-1',
                        date: '2025-11-21',
                        times: [
                            {
                                id: 't1',
                                startTime: '09:00',
                                endTime: '09:30',
                                isBooked: false,
                            },
                        ],
                        doulaId: 'doula-1',
                    },
                ],
            },
        },
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_availability_dto_1.CreateDoulaServiceAvailability, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "createSlots", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get availability for a doula between dates' }),
    (0, swagger_1.ApiQuery)({ name: 'doulaId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true }),
    (0, swagger_1.ApiQuery)({
        name: 'filter',
        required: false,
        description: 'all | booked | unbooked',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Availability fetched',
                data: {
                    items: [
                        {
                            id: 'date-avail-1',
                            date: '2025-11-21',
                            times: [
                                {
                                    id: 't1',
                                    startTime: '09:00',
                                    endTime: '09:30',
                                    isBooked: false,
                                },
                            ],
                        },
                    ],
                    total: 1,
                    page: 1,
                    limit: 10,
                },
            },
        },
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "getMyAvailabilities", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get availability by date id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Date availability id' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Availability fetched',
                data: {
                    id: 'date-avail-1',
                    date: '2025-11-21',
                    times: [{ id: 't1', startTime: '09:00' }],
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "getSlotById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a specific availability time' }),
    (0, swagger_1.ApiBody)({ type: service_availability_dto_1.UpdateDoulaServiceAvailabilityDTO }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Availability updated',
                data: { id: 'date-avail-1', timeId: 't1' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_availability_dto_1.UpdateDoulaServiceAvailabilityDTO, String, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "updateSlot", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete availability (by id) for the doula' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: { success: true, message: 'Availability deleted', data: null },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "deleteSlot", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOULA),
    (0, common_1.Patch)('/date/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update all time entries for a date availability (helper)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Availability times updated',
                data: null,
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoulaServiceAvailabilityController.prototype, "updateSlotTimeByDate", null);
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