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
exports.EnquiryController = void 0;
const common_1 = require("@nestjs/common");
const enquiry_forms_service_1 = require("./enquiry-forms.service");
const create_enquiry_forms_dto_1 = require("./dto/create-enquiry-forms.dto");
const swagger_1 = require("@nestjs/swagger");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let EnquiryController = class EnquiryController {
    enquiryService;
    constructor(enquiryService) {
        this.enquiryService = enquiryService;
    }
    async submit(dto) {
        return this.enquiryService.submitEnquiry(dto);
    }
    getAllEnquiries(page = '1', limit = '10', req) {
        return this.enquiryService.getAllEnquiries(parseInt(page), parseInt(limit), req.user.id);
    }
    getEnquiryById(id, req) {
        return this.enquiryService.getEnquiryById(id, req.user.id);
    }
    deleteEnquiry(id) {
        return this.enquiryService.deleteEnquiry(id);
    }
    deleteallEnquiry() {
        return this.enquiryService.deleteAllEnquiryForms();
    }
};
exports.EnquiryController = EnquiryController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Submit an enquiry form' }),
    (0, swagger_1.ApiBody)({ type: create_enquiry_forms_dto_1.EnquiryFormDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Enquiry submitted successfully',
                data: {
                    id: 'enquiry-uuid',
                    name: 'John Doe',
                    serviceId: 'service-uuid',
                },
            },
        },
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_enquiry_forms_dto_1.EnquiryFormDto]),
    __metadata("design:returntype", Promise)
], EnquiryController.prototype, "submit", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated list of enquiries' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Enquiries fetched',
                data: {
                    items: [{ id: 'e1', name: 'John Doe', serviceId: 's1' }],
                    total: 1,
                    page: 1,
                    limit: 10,
                },
            },
        },
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], EnquiryController.prototype, "getAllEnquiries", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get enquiry by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Enquiry fetched',
                data: { id: 'enquiry-uuid', name: 'Jane', email: 'jane@example.com' },
            },
        },
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ZONE_MANAGER),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnquiryController.prototype, "getEnquiryById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete enquiry' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: { success: true, message: 'Enquiry deleted', data: null },
        },
    }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnquiryController.prototype, "deleteEnquiry", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete all enquiries' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: { success: true, message: 'All enquiries deleted', data: null },
        },
    }),
    (0, common_1.Delete)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnquiryController.prototype, "deleteallEnquiry", null);
exports.EnquiryController = EnquiryController = __decorate([
    (0, swagger_1.ApiTags)('Enquiry Forms'),
    (0, common_1.Controller)({
        path: 'enquiry/form',
        version: '1',
    }),
    __metadata("design:paramtypes", [enquiry_forms_service_1.EnquiryService])
], EnquiryController);
//# sourceMappingURL=enquiry-forms.controller.js.map