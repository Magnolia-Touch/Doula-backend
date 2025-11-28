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
exports.AvailableSlotsController = void 0;
const common_1 = require("@nestjs/common");
const meetings_availability_service_1 = require("./meetings-availability.service");
const meeting_avail_dto_1 = require("./dto/meeting-avail.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
let AvailableSlotsController = class AvailableSlotsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async createSlots(dto, req) {
        const results = await Promise.all(dto.map(item => this.service.createAvailability(item, req.user)));
        return results;
    }
    async getAllSlots(regionId, startDate, endDate, filter = 'all', page = '1', limit = '10') {
        if (!regionId)
            throw new common_1.BadRequestException('regionId is required');
        if (!startDate)
            throw new common_1.BadRequestException('startDate is required');
        if (!endDate)
            throw new common_1.BadRequestException('endDate is required');
        return this.service.getAllSlots(regionId, startDate, endDate, filter, parseInt(page, 10), parseInt(limit, 10));
    }
    async getSlotById(id) {
        return this.service.getSlotById(id);
    }
    async updateSlot(dto, req) {
        return this.service.updateSlotTimeById(dto, req.user.id);
    }
    async deleteSlot(slotId, req) {
        return this.service.deleteSlots(slotId, req.user.id);
    }
    async updateSlotAvail(id, booked, availabe) {
        return this.service.updateTimeSlotAvailability(id, booked, availabe);
    }
};
exports.AvailableSlotsController = AvailableSlotsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create availability slots (one or many time ranges per date)' }),
    (0, swagger_1.ApiBody)({ type: meeting_avail_dto_1.AvailableSlotsForMeetingDto, isArray: true }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Slots created',
                data: [
                    {
                        id: 'date-slot-1',
                        date: '2025-11-21',
                        times: [
                            { id: 'time-1', startTime: '09:00', endTime: '09:30', isBooked: false, available: true },
                            { id: 'time-2', startTime: '10:00', endTime: '10:30', isBooked: false, available: true },
                        ],
                        regionId: 'region-1',
                    },
                ],
            },
        },
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], AvailableSlotsController.prototype, "createSlots", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get slots for a region between dates' }),
    (0, swagger_1.ApiQuery)({ name: 'regionId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'filter', required: false, description: 'all | booked | unbooked' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Slots fetched',
                data: {
                    items: [
                        {
                            id: 'date-slot-1',
                            date: '2025-11-21',
                            times: [
                                { id: 'time-1', startTime: '09:00', endTime: '09:30', isBooked: false, available: true },
                                { id: 'time-2', startTime: '10:00', endTime: '10:30', isBooked: true, available: false },
                            ],
                            regionId: 'region-1',
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
    __param(0, (0, common_1.Query)('regionId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('filter')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AvailableSlotsController.prototype, "getAllSlots", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get slot by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Slot fetched',
                data: {
                    id: 'date-slot-1',
                    date: '2025-11-21',
                    times: [
                        { id: 'time-1', startTime: '09:00', endTime: '09:30', isBooked: false, available: true },
                    ],
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvailableSlotsController.prototype, "getSlotById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)('ZONE_MANAGER', 'ADMIN', 'DOULA'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a timeslot (start/end) or its metadata' }),
    (0, swagger_1.ApiBody)({ type: meeting_avail_dto_1.UpdateSlotsForMeetingTimeDto }),
    (0, swagger_1.ApiResponse)({ status: 200, type: swagger_response_dto_1.SwaggerResponseDto, schema: { example: { success: true, message: 'Slot updated', data: { timeSlotId: 'time-1' } } } }),
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [meeting_avail_dto_1.UpdateSlotsForMeetingTimeDto, Object]),
    __metadata("design:returntype", Promise)
], AvailableSlotsController.prototype, "updateSlot", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)('ZONE_MANAGER', 'ADMIN', 'DOULA'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a date-slot (and its time entries)' }),
    (0, swagger_1.ApiParam)({ name: 'slotId', description: 'Date slot id' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: swagger_response_dto_1.SwaggerResponseDto, schema: { example: { success: true, message: 'Slot deleted', data: null } } }),
    (0, common_1.Delete)(':slotId'),
    __param(0, (0, common_1.Param)('slotId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AvailableSlotsController.prototype, "deleteSlot", null);
__decorate([
    (0, common_1.Patch)('mark/availability/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a time entry availability/booked' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Time slot entry id' }),
    (0, swagger_1.ApiBody)({ schema: { example: { booked: true, availabe: false } } }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: { example: { success: true, message: 'Time availability updated', data: { id: 'time-1', booked: true, availabe: false } } },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('booked')),
    __param(2, (0, common_1.Body)('availabe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Boolean]),
    __metadata("design:returntype", Promise)
], AvailableSlotsController.prototype, "updateSlotAvail", null);
exports.AvailableSlotsController = AvailableSlotsController = __decorate([
    (0, swagger_1.ApiTags)('Meeting Slots'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.Controller)({
        path: 'slots',
        version: '1',
    }),
    __metadata("design:paramtypes", [meetings_availability_service_1.AvailableSlotsService])
], AvailableSlotsController);
//# sourceMappingURL=meetings-availability.controller.js.map