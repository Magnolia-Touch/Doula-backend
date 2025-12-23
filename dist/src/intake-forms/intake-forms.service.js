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
const client_1 = require("@prisma/client");
let IntakeFormService = class IntakeFormService {
    prisma;
    mail;
    constructor(prisma, mail) {
        this.prisma = prisma;
        this.mail = mail;
    }
    async createIntakeForm(dto) {
        const { name, email, phone, doulaProfileId, serviceId, address, buffer = 0, seviceStartDate, serviceEndDate, visitFrequency, serviceTimeSlots } = dto;
        const clientUser = await (0, service_utils_1.getOrcreateClent)(this.prisma, {
            name,
            email,
            phone,
        });
        const clientProfile = await this.prisma.clientProfile.update({
            where: { userId: clientUser.id },
            data: { address },
        });
        const region = await this.prisma.region.findFirst({
            where: { doula: { some: { id: doulaProfileId } } },
        });
        if (!region) {
            throw new common_1.BadRequestException('Region not listed for doula');
        }
        const service = await this.prisma.servicePricing.findUnique({
            where: { id: serviceId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const startDate = new Date(seviceStartDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(serviceEndDate);
        endDate.setHours(0, 0, 0, 0);
        if (startDate > endDate) {
            throw new common_1.BadRequestException('Invalid service date range');
        }
        const [startStr, endStr] = serviceTimeSlots.split('-');
        const slotStartTime = new Date(`1970-01-01T${startStr}:00`);
        const slotEndTime = new Date(`1970-01-01T${endStr}:00`);
        if (slotStartTime >= slotEndTime) {
            throw new common_1.BadRequestException('Invalid time slot');
        }
        const DAY_TO_WEEKDAY = {
            0: client_1.WeekDays.SUNDAY,
            1: client_1.WeekDays.MONDAY,
            2: client_1.WeekDays.TUESDAY,
            3: client_1.WeekDays.WEDNESDAY,
            4: client_1.WeekDays.THURSDAY,
            5: client_1.WeekDays.FRIDAY,
            6: client_1.WeekDays.SATURDAY,
        };
        const visitDates = await (0, service_utils_1.generateVisitDates)(startDate, endDate, visitFrequency, buffer);
        const schedulesToCreate = [];
        for (const visitDate of visitDates) {
            const weekday = DAY_TO_WEEKDAY[visitDate.getDay()];
            const daySlot = await this.prisma.availableSlotsForService.findUnique({
                where: {
                    doulaId_weekday: {
                        doulaId: doulaProfileId,
                        weekday,
                    },
                },
                include: {
                    AvailableSlotsTimeForService: {
                        where: { availabe: true },
                    },
                },
            });
            if (!daySlot || !daySlot.availabe)
                continue;
            const hasTimeSlot = daySlot.AvailableSlotsTimeForService.some(ts => (0, service_utils_1.isOverlapping)(slotStartTime, slotEndTime, ts.startTime, ts.endTime));
            if (!hasTimeSlot)
                continue;
            const conflict = await this.prisma.schedules.findFirst({
                where: {
                    doulaProfileId,
                    date: visitDate,
                    AND: [
                        { startTime: { lt: slotEndTime } },
                        { endTime: { gt: slotStartTime } },
                    ],
                },
            });
            if (conflict)
                continue;
            schedulesToCreate.push({
                date: visitDate,
                startTime: slotStartTime,
                endTime: slotEndTime,
                doulaProfileId,
                serviceId: service.id,
                clientId: clientProfile.id,
            });
        }
        if (!schedulesToCreate.length) {
            throw new common_1.BadRequestException('No valid schedules available for the selected dates and time slot');
        }
        const [intake, booking] = await this.prisma.$transaction([
            this.prisma.intakeForm.create({
                data: {
                    name,
                    email,
                    phone,
                    address,
                    startDate,
                    endDate,
                    regionId: region.id,
                    servicePricingId: service.id,
                    doulaProfileId,
                    clientId: clientProfile.id,
                },
            }),
            this.prisma.serviceBooking.create({
                data: {
                    startDate,
                    endDate,
                    regionId: region.id,
                    servicePricingId: service.id,
                    doulaProfileId,
                    clientId: clientProfile.id,
                },
            }),
            this.prisma.schedules.createMany({
                data: schedulesToCreate,
            }),
        ]);
        return {
            intake,
            booking,
            schedulesCreated: schedulesToCreate.length,
        };
    }
    async getAllForms(page, limit) {
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.intakeForm,
            page,
            limit,
            orderBy: { createdAt: 'desc' },
            include: {
                region: { select: { regionName: true } },
                service: {
                    select: {
                        price: true,
                        service: { select: { name: true } },
                    },
                },
                clientProfile: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                DoulaProfile: {
                    select: {
                        id: true,
                        user: { select: { id: true } },
                    },
                },
            },
        });
        const data = result.data.map((form) => ({
            intakeFormId: form.id,
            serviceStartDate: form.startDate,
            serviceEndDate: form.endDate,
            location: form.location,
            clientName: form.name ?? form.clientProfile.user.name,
            clientEmail: form.email ?? form.clientProfile.user.email,
            clientPhone: form.phone ?? form.clientProfile.user.phone,
            regionName: form.region.regionName,
            serviceName: form.service.service.name,
            servicePrice: form.service.price,
            clientId: form.clientProfile.user.id,
            clientProfileId: form.clientProfile.id,
            userId: form.DoulaProfile.user.id,
            doulaProfileId: form.DoulaProfile.id,
        }));
        return {
            ...result,
            data,
        };
    }
    async getFormById(id) {
        const form = await this.prisma.intakeForm.findUnique({
            where: { id },
            include: {
                region: {
                    select: {
                        regionName: true,
                    },
                },
                service: {
                    select: {
                        price: true,
                        service: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                clientProfile: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                DoulaProfile: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
                slot: true,
                slotTime: true,
            },
        });
        if (!form) {
            throw new common_1.NotFoundException('Intake form not found');
        }
        return {
            intakeFormId: form.id,
            serviceStartDate: form.startDate,
            serviceEndDate: form.endDate,
            location: form.location,
            address: form.address,
            clientName: form.name ?? form.clientProfile.user.name,
            clientEmail: form.email ?? form.clientProfile.user.email,
            clientPhone: form.phone ?? form.clientProfile.user.phone,
            regionName: form.region.regionName,
            serviceName: form.service.service.name,
            servicePrice: form.service.price,
            clientId: form.clientProfile.user.id,
            clientProfileId: form.clientProfile.id,
            userId: form.DoulaProfile.user.id,
            doulaProfileId: form.DoulaProfile.id,
            slots: form.slot,
            slotTimes: form.slotTime,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt,
        };
    }
    async deleteForm(id) {
        const intake = await this.prisma.intakeForm.findUnique({
            where: { id },
        });
        if (!intake) {
            throw new common_1.NotFoundException('Intake not found');
        }
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
    async BookDoula(dto, userId) {
        const { name, email, phone, location, address, doulaProfileId, serviceId, serviceStartDate, servicEndDate, visitFrequency, timeSlots, } = dto;
        const clientProfile = await this.prisma.clientProfile.update({
            where: { userId },
            data: { address },
        });
        const region = await this.prisma.region.findFirst({
            where: { doula: { some: { id: doulaProfileId } } },
        });
        if (!region) {
            throw new common_1.BadRequestException('Region not listed for doula');
        }
        const service = await this.prisma.servicePricing.findUnique({
            where: { id: serviceId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const [startStr, endStr] = timeSlots.split('-');
        const slotStartTime = new Date(`1970-01-01T${startStr}:00`);
        const slotEndTime = new Date(`1970-01-01T${endStr}:00`);
        if (slotStartTime >= slotEndTime) {
            throw new common_1.BadRequestException('Invalid time slot');
        }
        const startDate = new Date(serviceStartDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(servicEndDate);
        endDate.setHours(0, 0, 0, 0);
        if (startDate > endDate) {
            throw new common_1.BadRequestException('Invalid service date range');
        }
        const BUFFER_DAYS = 0;
        const visitDates = await (0, service_utils_1.generateVisitDates)(startDate, endDate, visitFrequency, BUFFER_DAYS);
        const schedulesToCreate = [];
        const DAY_TO_WEEKDAY = {
            0: client_1.WeekDays.SUNDAY,
            1: client_1.WeekDays.MONDAY,
            2: client_1.WeekDays.TUESDAY,
            3: client_1.WeekDays.WEDNESDAY,
            4: client_1.WeekDays.THURSDAY,
            5: client_1.WeekDays.FRIDAY,
            6: client_1.WeekDays.SATURDAY,
        };
        for (const visitDate of visitDates) {
            const weekday = DAY_TO_WEEKDAY[visitDate.getDay()];
            const daySlot = await this.prisma.availableSlotsForService.findUnique({
                where: {
                    doulaId_weekday: {
                        doulaId: doulaProfileId,
                        weekday,
                    },
                },
                include: {
                    AvailableSlotsTimeForService: {
                        where: { availabe: true },
                    },
                },
            });
            if (!daySlot || !daySlot.availabe)
                continue;
            const hasTimeAvailability = daySlot.AvailableSlotsTimeForService.some(ts => (0, service_utils_1.isOverlapping)(slotStartTime, slotEndTime, ts.startTime, ts.endTime));
            if (!hasTimeAvailability)
                continue;
            const conflict = await this.prisma.schedules.findFirst({
                where: {
                    doulaProfileId,
                    date: visitDate,
                    AND: [
                        { startTime: { lt: slotEndTime } },
                        { endTime: { gt: slotStartTime } },
                    ],
                },
            });
            if (conflict)
                continue;
            schedulesToCreate.push({
                date: visitDate,
                startTime: slotStartTime,
                endTime: slotEndTime,
                doulaProfileId,
                serviceId: service.id,
                clientId: clientProfile.id,
            });
        }
        if (!schedulesToCreate.length) {
            throw new common_1.BadRequestException('No valid schedules available for the selected dates and time slot');
        }
        const [intake, booking] = await this.prisma.$transaction([
            this.prisma.intakeForm.create({
                data: {
                    name,
                    email,
                    phone,
                    address,
                    location,
                    startDate,
                    endDate,
                    regionId: region.id,
                    servicePricingId: service.id,
                    doulaProfileId,
                    clientId: clientProfile.id,
                },
            }),
            this.prisma.serviceBooking.create({
                data: {
                    startDate,
                    endDate,
                    regionId: region.id,
                    servicePricingId: service.id,
                    doulaProfileId,
                    clientId: clientProfile.id,
                },
            }),
            this.prisma.schedules.createMany({
                data: schedulesToCreate,
            }),
        ]);
        return {
            intake,
            booking,
            schedulesCreated: schedulesToCreate.length,
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