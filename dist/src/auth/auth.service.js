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
                adminProfile: {
                    include: {
                        notes: true,
                    },
                },
                doulaProfile: {
                    include: {
                        Region: true,
                        DoulaGallery: true,
                    },
                },
                clientProfile: true,
                zonemanagerprofile: {
                    include: {
                        managingRegion: true,
                        doulas: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        phone: true,
                                        is_active: true,
                                        role: true,
                                    },
                                },
                                Region: true,
                                DoulaGallery: true,
                            },
                        },
                        notes: true,
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const baseUser = {
            userId: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            is_active: user.is_active,
            role: user.role,
        };
        switch (user.role) {
            case client_1.Role.ADMIN:
                return {
                    role: user.role,
                    user: baseUser,
                    profile: user.adminProfile
                        ? {
                            profileId: user.adminProfile.id,
                            profile_image: user.adminProfile.profile_image,
                            notes: user.adminProfile.notes,
                        }
                        : null,
                };
            case client_1.Role.ZONE_MANAGER:
                return {
                    role: user.role,
                    user: baseUser,
                    profile: user.zonemanagerprofile
                        ? {
                            profileId: user.zonemanagerprofile.id,
                            profile_image: user.zonemanagerprofile.profile_image,
                            managingRegions: user.zonemanagerprofile.managingRegion.map((region) => ({
                                regionId: region.id,
                                regionName: region.regionName,
                            })),
                            doulas: user.zonemanagerprofile.doulas.map((doula) => ({
                                doulaId: doula.id,
                                doulaProfile: {
                                    userId: doula.user.id,
                                    name: doula.user.name,
                                    email: doula.user.email,
                                    phone: doula.user.phone,
                                    is_active: doula.user.is_active,
                                    role: doula.user.role,
                                    qualification: doula.qualification,
                                    description: doula.description,
                                    achievements: doula.achievements,
                                    yoe: doula.yoe,
                                    languages: doula.languages,
                                    regions: doula.Region.map((r) => ({
                                        regionId: r.id,
                                        regionName: r.regionName,
                                    })),
                                    doulaImages: doula.DoulaGallery,
                                },
                            })),
                            notes: user.zonemanagerprofile.notes,
                        }
                        : null,
                };
            case client_1.Role.DOULA:
                return {
                    role: user.role,
                    user: baseUser,
                    profile: user.doulaProfile
                        ? {
                            profileId: user.doulaProfile.id,
                            description: user.doulaProfile.description,
                            qualification: user.doulaProfile.qualification,
                            achievements: user.doulaProfile.achievements,
                            yoe: user.doulaProfile.yoe,
                            languages: user.doulaProfile.languages,
                            regions: user.doulaProfile.Region.map((region) => ({
                                regionId: region.id,
                                regionName: region.regionName,
                            })),
                            doulaImages: user.doulaProfile.DoulaGallery,
                        }
                        : null,
                };
            case client_1.Role.CLIENT:
                return {
                    role: user.role,
                    user: baseUser,
                    profile: user.clientProfile
                        ? {
                            profileId: user.clientProfile.id,
                            profile_image: user.clientProfile.profile_image,
                            region: user.clientProfile.region,
                            address: user.clientProfile.address,
                            is_verified: user.clientProfile.is_verified,
                        }
                        : null,
                };
            default:
                throw new common_1.BadRequestException('Unknown role or profile not assigned');
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