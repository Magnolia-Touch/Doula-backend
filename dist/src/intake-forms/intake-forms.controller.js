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
exports.IntakeFormController = void 0;
const common_1 = require("@nestjs/common");
const intake_forms_service_1 = require("./intake-forms.service");
const intake_form_dto_1 = require("./dto/intake-form.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
let IntakeFormController = class IntakeFormController {
    intakeService;
    constructor(intakeService) {
        this.intakeService = intakeService;
    }
    create(dto) {
        return this.intakeService.createIntakeForm(dto);
    }
    getAll(page = 1, limit = 10) {
        return this.intakeService.getAllForms(+page, +limit);
    }
    get(id) {
        return this.intakeService.getFormById(id);
    }
    delete(id) {
        return this.intakeService.deleteForm(id);
    }
    deleteallEnquiry() {
        return this.intakeService.deleteAllIntakeForms();
    }
    BookDoula(dto, req) {
        return this.intakeService.BookDoula(dto, req.user.id);
    }
};
exports.IntakeFormController = IntakeFormController;
__decorate([
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create Intake Form' }),
    (0, swagger_1.ApiBody)({ type: intake_form_dto_1.IntakeFormDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Intake form created',
                data: {
                    id: 'intake-uuid',
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    slotId: 'slot-uuid',
                    doulaProfileId: 'doula-uuid',
                    serviceId: 'service-uuid',
                },
            },
        },
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [intake_form_dto_1.IntakeFormDto]),
    __metadata("design:returntype", void 0)
], IntakeFormController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated intake forms' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Intake forms fetched',
                data: {
                    items: [{ id: 'i1', name: 'Jane', serviceId: 's1' }],
                    total: 1,
                    page: 1,
                    limit: 10,
                },
            },
        },
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IntakeFormController.prototype, "getAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get intake form by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Intake form fetched',
                data: { id: 'intake-uuid', name: 'Jane Doe', email: 'jane@example.com' },
            },
        },
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntakeFormController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete Intake Form' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: { example: { success: true, message: 'Intake form deleted', data: null } },
    }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntakeFormController.prototype, "delete", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete all intake forms' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: { example: { success: true, message: 'All intake forms deleted', data: null } },
    }),
    (0, common_1.Delete)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntakeFormController.prototype, "deleteallEnquiry", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Book Doula Service' }),
    (0, swagger_1.ApiBody)({ type: intake_form_dto_1.BookDoulaDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Intake form created',
                data: {
                    id: 'intake-uuid',
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    slotId: 'slot-uuid',
                    doulaProfileId: 'doula-uuid',
                    serviceId: 'service-uuid',
                },
            },
        },
    }),
    (0, common_1.Post)('book/doula'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [intake_form_dto_1.BookDoulaDto, Object]),
    __metadata("design:returntype", void 0)
], IntakeFormController.prototype, "BookDoula", null);
exports.IntakeFormController = IntakeFormController = __decorate([
    (0, swagger_1.ApiTags)('Intake Forms'),
    (0, common_1.Controller)({
        path: 'intake/forms',
        version: '1',
    }),
    __metadata("design:paramtypes", [intake_forms_service_1.IntakeFormService])
], IntakeFormController);
//# sourceMappingURL=intake-forms.controller.js.map