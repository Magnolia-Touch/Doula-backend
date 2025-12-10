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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const client_service_1 = require("../client/client.service");
const doula_service_1 = require("../doula/doula.service");
const zone_manager_service_1 = require("../zone_manager/zone_manager.service");
const admin_service_1 = require("../admin/admin.service");
const client_1 = require("@prisma/client");
const utils_1 = require("../common/utility/utils");
const mailer_1 = require("@nestjs-modules/mailer");
let AuthService = class AuthService {
    prisma;
    clients;
    admin;
    zonemanager;
    doula;
    jwtService;
    mailerService;
    constructor(prisma, clients, admin, zonemanager, doula, jwtService, mailerService) {
        this.prisma = prisma;
        this.clients = clients;
        this.admin = admin;
        this.zonemanager = zonemanager;
        this.doula = doula;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
    }
    async RegisterAdmin(dto) {
        const { name, email, phone } = dto;
        console.log(dto.email);
        let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (user) {
            throw new Error("User with this email already exists");
        }
        console.log(user);
        const created = await this.prisma.user.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                role: client_1.Role.ADMIN,
            }
        });
        return { message: "Otp Sent Succesfully", data: created };
    }
    async LoginOtp(dto) {
        const { email } = dto;
        const otp = (0, utils_1.generate6DigitOtp)();
        let user = await this.prisma.user.findUnique({ where: { email: email } });
        if (!user) {
            throw new Error("No User Found");
        }
        if (user.role == client_1.Role.DOULA || user.role == client_1.Role.ADMIN || user.role == client_1.Role.ZONE_MANAGER || user.role == client_1.Role.CLIENT) {
            await this.prisma.user.update({
                where: { email: email },
                data: {
                    otp: otp,
                    otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
                }
            });
            return { message: "Otp Sent Succesfully", data: otp };
        }
        else {
            throw new Error("Invalid Role.");
        }
    }
    async verifyOtp(dto) {
        const { email, otp } = dto;
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (!user.otp || !user.otpExpiresAt) {
            throw new common_1.UnauthorizedException('No OTP found for this user');
        }
        const isOtpValid = user.otp === otp;
        const isOtpNotExpired = user.otpExpiresAt > new Date();
        if (!isOtpValid || !isOtpNotExpired) {
            throw new common_1.UnauthorizedException('Invalid OTP or OTP has expired');
        }
        await this.prisma.user.update({
            where: { email },
            data: { otp: null, otpExpiresAt: null },
        });
        return {
            user: user,
            accessToken: this.jwtService.sign({
                sub: user.id,
                email: user.email,
            }),
            message: "User Verified Successfully",
            status: 200,
        };
    }
    async Profile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                adminProfile: true,
                doulaProfile: true,
                clientProfile: true,
                zonemanagerprofile: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        const role = user.role;
        switch (role) {
            case client_1.Role.ADMIN:
                return {
                    role,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        is_active: user.is_active,
                    },
                    profile: user.adminProfile,
                };
            case client_1.Role.DOULA:
                return {
                    role,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        is_active: user.is_active,
                    },
                    profile: user.doulaProfile,
                };
            case client_1.Role.CLIENT:
                return {
                    role,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        is_active: user.is_active,
                    },
                    profile: user.clientProfile,
                };
            case client_1.Role.ZONE_MANAGER:
                return {
                    role,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        is_active: user.is_active,
                    },
                    profile: user.zonemanagerprofile,
                };
            default:
                throw new common_1.BadRequestException("Unknown role or profile not assigned");
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        client_service_1.ClientsService,
        admin_service_1.AdminService,
        zone_manager_service_1.ZoneManagerService,
        doula_service_1.DoulaService,
        jwt_1.JwtService,
        mailer_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map