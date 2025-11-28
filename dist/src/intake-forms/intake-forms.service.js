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
exports.IntakeFormService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_util_1 = require("../common/utility/pagination.util");
const service_utils_1 = require("../common/utility/service-utils");
const mailer_1 = require("@nestjs-modules/mailer");
let IntakeFormService = class IntakeFormService {
    prisma;
    mail;
    constructor(prisma, mail) {
        this.prisma = prisma;
        this.mail = mail;
    }
    async createIntakeForm(dto) {
        const { name, email, phone } = dto;
        const data = { name: dto.name, email: dto.email, phone: dto.phone };
        const client = await (0, service_utils_1.getOrcreateClent)(this.prisma, data);
        console.log("client", client);
        const clientprofile = await this.prisma.clientProfile.update({
            where: { userId: client.id },
            data: { address: dto.address },
        });
        const region = await this.prisma.region.findFirst({
            where: { doula: { some: { id: dto.doulaProfileId } } }
        });
        if (!region) {
            throw new common_1.BadRequestException("Region not listed for doula");
        }
        const slot = await this.prisma.availableSlotsForService.findUnique({
            where: { id: dto.slotId }
        });
        if (!slot || !slot.availabe || slot.isBooked) {
            throw new common_1.BadRequestException('Selected slot is not available');
        }
        const service = await this.prisma.servicePricing.findUnique({
            where: { id: dto.serviceId }
        });
        if (!service) {
            throw new common_1.NotFoundException('Service Not Found');
        }
        const leftEndDate = new Date(slot.date);
        leftEndDate.setDate(slot.date.getDate() - dto.buffer);
        const rightEndDate = new Date(slot.date);
        rightEndDate.setDate(slot.date.getDate() + dto.buffer);
        const intake = await this.prisma.intakeForm.create({
            data: {
                date: slot.date,
                name,
                email,
                phone,
                address: dto.address,
                regionId: region.id,
                servicePricingId: service.id,
                doulaProfileId: dto.doulaProfileId,
                clientId: clientprofile.id,
                slotId: slot.id,
            },
        });
        console.log("intake form", intake);
        const booking = await this.prisma.serviceBooking.create({
            data: {
                date: slot.date,
                regionId: region.id,
                servicePricingId: service.id,
                doulaProfileId: dto.doulaProfileId,
                clientId: clientprofile.id,
                slotId: slot.id
            },
        });
        console.log("intake form", intake);
        await this.prisma.availableSlotsForService.updateMany({
            where: {
                doulaId: dto.doulaProfileId,
                date: { gte: leftEndDate, lte: rightEndDate },
            },
            data: {
                availabe: false,
                isBooked: true,
            },
        });
        return { intake, booking };
    }
    async getAllForms(page, limit) {
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.intakeForm,
            page,
            limit,
            include: { clientProfile: true, DoulaProfile: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getFormById(id) {
        const form = await this.prisma.intakeForm.findUnique({
            where: { id },
            include: {
                clientProfile: true,
                DoulaProfile: true,
                service: true,
                region: true,
                slot: true,
            },
        });
        if (!form)
            throw new common_1.NotFoundException('Intake form not found');
        return form;
    }
    async deleteForm(id) {
        const intake = await this.prisma.intakeForm.findUnique({
            where: { id },
        });
        if (!intake) {
            throw new common_1.NotFoundException('Intake not found');
        }
        await this.prisma.availableSlotsForService.update({
            where: { id: intake.slotId },
            data: { isBooked: false, availabe: true },
        });
        await this.prisma.intakeForm.delete({ where: { id } });
        return { message: 'Intake deleted successfully and slot unlocked' };
    }
    async deleteAllIntakeForms() {
        const result = await this.prisma.intakeForm.deleteMany({});
        return {
            message: "All enquiry forms deleted successfully",
            deletedCount: result.count,
        };
    }
};
exports.IntakeFormService = IntakeFormService;
exports.IntakeFormService = IntakeFormService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_1.MailerService])
], IntakeFormService);
//# sourceMappingURL=intake-forms.service.js.map