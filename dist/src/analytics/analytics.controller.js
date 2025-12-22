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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const filter_user_dto_1 = require("./filter-user.dto");
const swagger_1 = require("@nestjs/swagger");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AnalyticsController = class AnalyticsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async listUsers(query) {
        return this.service.listUsers(query);
    }
    async getCounts() {
        return this.service.countUsersByRole();
    }
    async ActivegetCounts() {
        return this.service.ActivecountUsersByRole();
    }
    async inactivegetCounts() {
        return this.service.inactivecountUsersByRole();
    }
    async getStats() {
        return this.service.getBookingStats();
    }
    async getMeetigStats() {
        return this.service.getMeetingstats();
    }
    async getDailyActivity(startDate, endDate) {
        return this.service.getDailyActivity(startDate, endDate);
    }
    async calenderSummary(req, startDate, endDate) {
        return this.service.calenderSummary(req.user.id, startDate, endDate);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'List users (paginated + optional role filter)',
        description: 'Returns a paginated list of users. Use `page` and `limit` for pagination. Optionally filter by `role`.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, description: 'Filter by role (ADMIN, CLIENT, DOULA, ZONE_MANAGER)', type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Users fetched successfully',
                data: {
                    items: [
                        { id: 'uuid-1', name: 'Jane Doe', email: 'jane@example.com', role: 'CLIENT' },
                        { id: 'uuid-2', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' }
                    ],
                    total: 2,
                    page: 1,
                    limit: 10,
                },
            },
        },
    }),
    (0, common_1.Get)('user/list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_user_dto_1.FilterUserDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "listUsers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get counts of users grouped by role' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Counts by role fetched',
                data: {
                    ADMIN: 2,
                    CLIENT: 120,
                    DOULA: 8,
                    ZONE_MANAGER: 3,
                },
            },
        },
    }),
    (0, common_1.Get)('counts/user'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCounts", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get counts of Active users grouped by role' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Active Counts by role fetched',
                data: {
                    ADMIN: 2,
                    CLIENT: 120,
                    DOULA: 8,
                    ZONE_MANAGER: 3,
                },
            },
        },
    }),
    (0, common_1.Get)('counts/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "ActivegetCounts", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get counts of Inactive users grouped by role' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Inactive Counts by role fetched',
                data: {
                    ADMIN: 2,
                    CLIENT: 120,
                    DOULA: 8,
                    ZONE_MANAGER: 3,
                },
            },
        },
    }),
    (0, common_1.Get)('counts/inactive'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "inactivegetCounts", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get booking statistics (aggregated)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Booking stats fetched',
                data: {
                    ACTIVE: 64,
                    COMPLETED: 100,
                    CANCELED: 4
                },
            },
        },
    }),
    (0, common_1.Get)('counts/booking'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get Meetings aggregated results' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Meetings stats fetched',
                data: {
                    SCHEDULED: 12,
                    COMPLETED: 5,
                    CANCELED: 0
                },
            },
        },
    }),
    (0, common_1.Get)('counts/meeting'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMeetigStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get Weekly / Daily Activity Analytics' }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2025-11-01',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2025-11-07',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Daily activity statistics fetched successfully',
        schema: {
            example: {
                success: true,
                message: 'Weekly activity fetched',
                data: [
                    {
                        date: '2025-11-01',
                        weekday: 'Sat',
                        noOfBookings: 2,
                        noOfMeetings: 1,
                    },
                    {
                        date: '2025-11-02',
                        weekday: 'Sun',
                        noOfBookings: 0,
                        noOfMeetings: 3,
                    },
                    {
                        date: '2025-11-03',
                        weekday: 'Mon',
                        noOfBookings: 4,
                        noOfMeetings: 2,
                    },
                    {
                        date: '2025-11-04',
                        weekday: 'Tue',
                        noOfBookings: 3,
                        noOfMeetings: 4,
                    },
                    {
                        date: '2025-11-05',
                        weekday: 'Wed',
                        noOfBookings: 5,
                        noOfMeetings: 6,
                    },
                    {
                        date: '2025-11-06',
                        weekday: 'Thu',
                        noOfBookings: 7,
                        noOfMeetings: 5,
                    },
                    {
                        date: '2025-11-07',
                        weekday: 'Fri',
                        noOfBookings: 6,
                        noOfMeetings: 8,
                    },
                ],
            },
        },
    }),
    (0, common_1.Get)('daily-activity'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDailyActivity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)('calender/summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "calenderSummary", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)({
        path: 'analytics',
        version: '1',
    }),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map