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
exports.ServiceBookingController = void 0;
const common_1 = require("@nestjs/common");
const service_booking_service_1 = require("./service-booking.service");
const swagger_1 = require("@nestjs/swagger");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
let ServiceBookingController = class ServiceBookingController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async findAll(query) {
        return this.bookingService.findAll({
            page: query.page ? Number(query.page) : undefined,
            limit: query.limit ? Number(query.limit) : undefined,
            status: query.status,
        });
    }
    getBookingById(id) {
        return this.bookingService.findById(id);
    }
};
exports.ServiceBookingController = ServiceBookingController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all service bookings' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Bookings fetched',
                data: [
                    {
                        id: 'booking-1',
                        service: { id: 'service-1', name: 'Prenatal Visit' },
                        client: { id: 'client-1', name: 'Ravi Kumar' },
                        doula: { id: 'doula-1', name: 'Neeta' },
                        slot: { id: 'slot-1', date: '2025-12-01', startTime: '14:00' },
                        status: 'CONFIRMED',
                        createdAt: '2025-11-20T10:00:00.000Z',
                    },
                ],
            },
        },
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ServiceBookingController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get a booking by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Booking fetched',
                data: {
                    id: 'booking-1',
                    service: { id: 'service-1', name: 'Prenatal Visit' },
                    client: {
                        id: 'client-1',
                        name: 'Ravi Kumar',
                        phone: '+919876543210',
                    },
                    doula: { id: 'doula-1', name: 'Neeta' },
                    slot: { id: 'slot-1', date: '2025-12-01', startTime: '14:00' },
                    status: 'CONFIRMED',
                    payment: {
                        id: 'pay-1',
                        amount: 1200,
                        currency: 'INR',
                        status: 'PAID',
                    },
                },
            },
        },
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceBookingController.prototype, "getBookingById", null);
exports.ServiceBookingController = ServiceBookingController = __decorate([
    (0, swagger_1.ApiTags)('Service Bookings'),
    (0, common_1.Controller)({
        path: 'service-booked',
        version: '1',
    }),
    __metadata("design:paramtypes", [service_booking_service_1.ServiceBookingService])
], ServiceBookingController);
//# sourceMappingURL=service-booking.controller.js.map