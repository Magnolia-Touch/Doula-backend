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
                    totalBookings: 320,
                    bookingsThisMonth: 24,
                    completedBookings: 290,
                    cancelledBookings: 30,
                    bookingsByService: {
                        'prenatal-care': 120,
                        'postnatal-care': 200
                    }
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
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)({
        path: 'analytics',
        version: '1',
    }),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map