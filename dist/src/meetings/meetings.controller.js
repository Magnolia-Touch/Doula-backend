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
exports.MeetingsController = void 0;
const common_1 = require("@nestjs/common");
const meetings_service_1 = require("./meetings.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const schedule_doula_dto_1 = require("./dto/schedule-doula.dto");
const cancel_dto_1 = require("./dto/cancel.dto");
const reschedule_dto_1 = require("./dto/reschedule.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
let MeetingsController = class MeetingsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async getMeetings(params, req) {
        return this.service.getMeetings(params, req.user);
    }
    async getMeetingById(id, req) {
        return this.service.getMeetingById(id, req.user);
    }
    async scheduleDoulaMeeting(dto, req) {
        return this.service.doulasMeetingSchedule(dto, req.user);
    }
    async cancelMeeting(dto, req) {
        return this.service.cancelMeeting(dto, req.user);
    }
    async rescheduleMeeting(dto, req) {
        return this.service.rescheduleMeeting(dto, req.user);
    }
    async updateMeetingStatus(dto, req) {
        return this.service.updateMeetingStatus(dto, req.user);
    }
    async deleteAllMeetings(req) {
        return this.service.deleteAllMeetings(req.user);
    }
    async getAllMeetings() {
        return this.service.findAllmeetings();
    }
};
exports.MeetingsController = MeetingsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.DOULA, client_1.Role.ZONE_MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get meetings (filterable & paginated)',
        description: 'Fetch meetings for the authenticated user. Admins can filter for all. Supports startDate/endDate/status/page/limit.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'SCHEDULED | COMPLETED | CANCELED' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Meetings fetched successfully',
                data: {
                    items: [
                        {
                            id: 'meeting-uuid-1',
                            status: 'SCHEDULED',
                            createdAt: '2025-11-20T10:00:00.000Z',
                            slot: {
                                id: 'slot-uuid-1',
                                date: '2025-11-25',
                                startTime: '09:00',
                                endTime: '09:30',
                                region: { id: 'region-1', regionName: 'South City' },
                            },
                            service: { id: 'service-1', name: 'Postnatal Visit' },
                            doula: { id: 'doula-1', name: 'Jane Doe', phone: '+919876543210' },
                            bookedBy: { id: 'client-1', name: 'Asha Patel', email: 'asha@example.com' },
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
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "getMeetings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.DOULA, client_1.Role.ZONE_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get meeting by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Meeting UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Meeting fetched',
                data: {
                    id: 'meeting-uuid-1',
                    status: 'SCHEDULED',
                    slot: {
                        id: 'slot-uuid-1',
                        date: '2025-11-25',
                        startTime: '09:00',
                        endTime: '09:30',
                    },
                    service: { id: 'serv-1', name: 'Prenatal Visit' },
                    doula: { id: 'doula-1', name: 'Jane Doe' },
                    bookedBy: { id: 'client-1', name: 'Asha Patel', phone: '+919876543210' },
                    remarks: 'Client prefers video call',
                },
            },
        },
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "getMeetingById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule a meeting with a doula' }),
    (0, swagger_1.ApiBody)({ type: schedule_doula_dto_1.ScheduleDoulaDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Meeting scheduled',
                data: {
                    id: 'meeting-uuid-new',
                    status: 'SCHEDULED',
                    slot: { id: 'slot-uuid', date: '2025-11-30', startTime: '10:00', endTime: '10:30' },
                    doula: { id: 'doula-5', name: 'Priya Singh' },
                    bookedBy: { id: 'client-12', name: 'Ragini' },
                },
            },
        },
    }),
    (0, common_1.Post)('doula/schedule'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schedule_doula_dto_1.ScheduleDoulaDto, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "scheduleDoulaMeeting", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a meeting' }),
    (0, swagger_1.ApiBody)({ type: cancel_dto_1.cancelDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: { example: { success: true, message: 'Meeting cancelled', data: { meetingId: 'meeting-uuid-1', status: 'CANCELED' } } },
    }),
    (0, common_1.Post)('cancel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cancel_dto_1.cancelDto, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "cancelMeeting", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Reschedule a meeting to a new slot' }),
    (0, swagger_1.ApiBody)({ type: reschedule_dto_1.RescheduleDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Meeting rescheduled',
                data: {
                    meetingId: 'meeting-uuid-1',
                    oldSlotId: 'slot-old',
                    newSlot: { id: 'slot-new', date: '2025-12-05', startTime: '11:00', endTime: '11:30' },
                    status: 'SCHEDULED',
                },
            },
        },
    }),
    (0, common_1.Post)('reschedule'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reschedule_dto_1.RescheduleDto, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "rescheduleMeeting", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update meeting status (ADMIN/DOULA)' }),
    (0, swagger_1.ApiBody)({ type: update_status_dto_1.UpdateStatusDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: { example: { success: true, message: 'Meeting status updated', data: { meetingId: 'meeting-uuid-1', status: 'COMPLETED' } } },
    }),
    (0, common_1.Patch)('status'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_status_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "updateMeetingStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all meetings (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: { example: { success: true, message: 'All meetings deleted', data: null } },
    }),
    (0, common_1.Delete)('delete-all'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "deleteAllMeetings", null);
__decorate([
    (0, common_1.Get)("all/meetings"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "getAllMeetings", null);
exports.MeetingsController = MeetingsController = __decorate([
    (0, swagger_1.ApiTags)('Meetings'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.Controller)({
        path: 'meetings',
        version: '1',
    }),
    __metadata("design:paramtypes", [meetings_service_1.MeetingsService])
], MeetingsController);
//# sourceMappingURL=meetings.controller.js.map