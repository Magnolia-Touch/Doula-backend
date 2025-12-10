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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const registration_dto_1 = require("./dto/registration.dto");
const otp_verify_dto_1 = require("./dto/otp-verify.dto");
const swagger_1 = require("@nestjs/swagger");
const swagger_response_dto_1 = require("../common/dto/swagger-response.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const roles_guard_1 = require("../common/guards/roles.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async RegistrationAdmin(dto) {
        return this.authService.RegisterAdmin(dto);
    }
    async LoginOtp(dto) {
        return this.authService.LoginOtp(dto);
    }
    async verifyOtp(dto) {
        return this.authService.verifyOtp(dto);
    }
    async myProfile(req) {
        const userId = req.user.id;
        return this.authService.Profile(userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Send registration OTP (admin)' }),
    (0, swagger_1.ApiBody)({ type: registration_dto_1.RegistrationDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'OTP sent to admin email',
                data: null,
            },
        },
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.Post)('register/admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registration_dto_1.RegistrationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "RegistrationAdmin", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Send login OTP' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'OTP sent to the provided email',
                data: null,
            },
        },
    }),
    (0, common_1.Post)('send/otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "LoginOtp", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP and login/register' }),
    (0, swagger_1.ApiBody)({ type: otp_verify_dto_1.OtpVerifyDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: swagger_response_dto_1.SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'OTP verified. User logged in/registered',
                data: {
                    token: 'jwt-token',
                    user: {
                        id: 'user-uuid',
                        email: 'user@example.com',
                        role: 'CLIENT'
                    }
                }
            }
        }
    }),
    (0, common_1.Post)('verify/otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [otp_verify_dto_1.OtpVerifyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "myProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)({
        path: 'auth',
        version: '1',
    }),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map