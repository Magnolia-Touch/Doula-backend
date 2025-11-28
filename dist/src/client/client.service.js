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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ClientsService = class ClientsService {
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
        const clients = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: client_1.Role.CLIENT,
                clientProfile: {
                    create: {},
                },
            },
            include: { clientProfile: true },
        });
        return { message: 'Clients created successfully', data: clients };
    }
    async get() {
        const clientss = await this.prisma.user.findMany({
            where: { role: client_1.Role.CLIENT },
            include: { clientProfile: true }
        });
        return { message: "Clients Fetched Successfully", data: clientss };
    }
    async getById(id) {
        const clients = await this.prisma.user.findUnique({
            where: { id },
            include: { clientProfile: true },
        });
        if (!clients || clients.role !== client_1.Role.CLIENT) {
            throw new common_1.NotFoundException('Clients not found');
        }
        return { message: 'Clients fetched successfully', data: clients };
    }
    async delete(id) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== client_1.Role.CLIENT) {
            throw new common_1.NotFoundException('Client not found');
        }
        await this.prisma.user.delete({ where: { id } });
        return { message: 'Client deleted successfully', data: null };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=client.service.js.map