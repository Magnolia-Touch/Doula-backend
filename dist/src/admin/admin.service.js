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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const admin = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: client_1.Role.ADMIN,
                adminProfile: {
                    create: {},
                },
            },
            include: { zonemanagerprofile: true },
        });
        return { message: 'Admin created successfully', data: admin };
    }
    async get() {
        const admin = await this.prisma.user.findMany({
            where: { role: client_1.Role.ADMIN },
            include: { adminProfile: true },
        });
        return { message: 'Admins Fetched Successfully', data: admin };
    }
    async getById(id) {
        const admin = await this.prisma.user.findUnique({
            where: { id },
            include: { adminProfile: true },
        });
        if (!admin || admin.role !== client_1.Role.ADMIN) {
            throw new common_1.NotFoundException('Admin not found');
        }
        return { message: 'Admin fetched successfully', data: admin };
    }
    async delete(id) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== client_1.Role.ADMIN) {
            throw new common_1.NotFoundException('Admin not found');
        }
        await this.prisma.user.delete({ where: { id } });
        return { message: 'Admin deleted successfully', data: null };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map