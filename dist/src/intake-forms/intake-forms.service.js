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
        const { name, email, phone, doulaProfileId, serviceId, address, buffer, enquiryId } = dto;
        const data = { name: dto.name, email: dto.email, phone: dto.phone };
        const client = await (0, service_utils_1.getOrcreateClent)(this.prisma, data);
        const clientprofile = await this.prisma.clientProfile.update({
            where: { userId: client.id },
            data: { address: dto.address },
        });
        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id: dto.enquiryId },
            select: { endDate: true, startDate: true, VisitFrequency: true, TimeSlots: true }
        });
        if (!enquiry) {
            throw new common_1.BadRequestException("Enquiry not Found");
        }
        const region = await this.prisma.region.findFirst({
            where: { doula: { some: { id: dto.doulaProfileId } } }
        });
        if (!region) {
            throw new common_1.BadRequestException("Region not listed for doula");
        }
        const service = await this.prisma.servicePricing.findUnique({
            where: { id: dto.serviceId }
        });
        if (!service) {
            throw new common_1.NotFoundException('Service Not Found');
        }
        const leftEndDate = new Date(enquiry.startDate);
        const rightEndDate = new Date(enquiry.endDate);
        const dates = [];
        let current = new Date(leftEndDate);
        while (current <= rightEndDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + enquiry.VisitFrequency);
        }
        const [startStr, endStr] = enquiry.TimeSlots.split("-");
        const [startHour, startMinute] = startStr.split(":").map(Number);
        const [endHour, endMinute] = endStr.split(":").map(Number);
        function dateWithTime(date, hour, minute) {
            const d = new Date(date);
            d.setHours(hour, minute, 0, 0);
            return d;
        }
        const fetchedSlots = await this.prisma.availableSlotsForService.findMany({
            where: {
                date: { in: dates },
            },
            include: {
                AvailableSlotsTimeForService: {
                    where: {
                        AND: [
                            {
                                startTime: {
                                    gte: dateWithTime(new Date(enquiry.startDate), startHour, startMinute),
                                },
                            },
                            {
                                endTime: {
                                    lte: dateWithTime(new Date(enquiry.startDate), endHour, endMinute),
                                },
                            },
                        ],
                    },
                },
            },
            orderBy: { date: "asc" },
        });
        const parentSlotIds = fetchedSlots.map(s => s.id);
        const timeSlotIds = fetchedSlots
            .flatMap(s => s.AvailableSlotsTimeForService.map(ts => ts.id))
            .filter(Boolean);
        const startDate = new Date(enquiry.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(enquiry.endDate);
        endDate.setHours(0, 0, 0, 0);
        const bufferDays = Number(dto.buffer) || 0;
        const rangeAStart = new Date(startDate);
        rangeAStart.setDate(rangeAStart.getDate() - bufferDays);
        rangeAStart.setHours(0, 0, 0, 0);
        const rangeAEnd = new Date(startDate);
        rangeAEnd.setHours(23, 59, 59, 999);
        const rangeBStart = new Date(startDate);
        rangeBStart.setHours(0, 0, 0, 0);
        const rangeBEnd = new Date(endDate);
        rangeBEnd.setDate(rangeBEnd.getDate() + bufferDays);
        rangeBEnd.setHours(23, 59, 59, 999);
        const txOps = [];
        if (timeSlotIds.length > 0) {
            txOps.push(this.prisma.availableSlotsTimeForService.updateMany({
                where: { id: { in: timeSlotIds } },
                data: { availabe: false },
            }));
        }
        if (parentSlotIds.length > 0) {
            txOps.push(this.prisma.availableSlotsForService.updateMany({
                where: { id: { in: parentSlotIds } },
                data: { availabe: false, isBooked: true },
            }));
        }
        txOps.push(this.prisma.availableSlotsForService.updateMany({
            where: {
                date: {
                    gte: rangeAStart,
                    lte: rangeAEnd,
                },
            },
            data: { availabe: false },
        }));
        txOps.push(this.prisma.availableSlotsForService.updateMany({
            where: {
                date: {
                    gte: rangeBStart,
                    lte: rangeBEnd,
                },
            },
            data: { availabe: false },
        }));
        await this.prisma.$transaction(txOps);
        const intake = await this.prisma.intakeForm.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                name,
                email,
                phone,
                address,
                regionId: region.id,
                servicePricingId: service.id,
                doulaProfileId: doulaProfileId,
                clientId: clientprofile.id,
                slot: {
                    connect: parentSlotIds.map(id => ({ id }))
                },
                slotTime: {
                    connect: timeSlotIds.map(id => ({ id }))
                }
            },
        });
        const booking = await this.prisma.serviceBooking.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                regionId: region.id,
                servicePricingId: service.id,
                doulaProfileId: doulaProfileId,
                clientId: clientprofile.id,
                slot: {
                    connect: timeSlotIds.map(id => ({ id }))
                },
                AvailableSlotsForService: {
                    connect: parentSlotIds.map(id => ({ id }))
                }
            }
        });
        console.log("intake form", intake);
        const booked = await this.prisma.availableSlotsForService.findMany({
            where: { id: { in: parentSlotIds } },
            include: {
                AvailableSlotsTimeForService: {
                    where: { id: { in: timeSlotIds } }
                }
            }
        });
        const scheduleRecords = booked.flatMap(parent => {
            return parent.AvailableSlotsTimeForService.map(child => ({
                date: parent.date,
                startTime: child.startTime,
                endTime: child.endTime,
                doulaProfileId: doulaProfileId,
                serviceId: service.id,
                clientId: clientprofile.id,
            }));
        });
        await this.prisma.schedules.createMany({
            data: scheduleRecords
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
        const { name, email, phone, location, address, doulaProfileId, serviceId, serviceStartDate, servicEndDate, visitFrequency, timeSlots, buffer } = dto;
        const clientprofile = await this.prisma.clientProfile.update({
            where: { userId: userId },
            data: { address: dto.address },
        });
        const region = await this.prisma.region.findFirst({
            where: { doula: { some: { id: doulaProfileId } } }
        });
        if (!region) {
            throw new common_1.BadRequestException("Region not listed for doula");
        }
        const service = await this.prisma.servicePricing.findUnique({
            where: { id: serviceId }
        });
        if (!service) {
            throw new common_1.NotFoundException('Service Not Found');
        }
        const leftEndDate = new Date(serviceStartDate);
        const rightEndDate = new Date(servicEndDate);
        const dates = [];
        let current = new Date(leftEndDate);
        while (current <= rightEndDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + visitFrequency);
        }
        const [startStr, endStr] = timeSlots.split("-");
        const [startHour, startMinute] = startStr.split(":").map(Number);
        const [endHour, endMinute] = endStr.split(":").map(Number);
        function dateWithTime(date, hour, minute) {
            const d = new Date(date);
            d.setHours(hour, minute, 0, 0);
            return d;
        }
        const fetchedSlots = await this.prisma.availableSlotsForService.findMany({
            where: {
                date: { in: dates },
            },
            include: {
                AvailableSlotsTimeForService: {
                    where: {
                        AND: [
                            {
                                startTime: {
                                    gte: dateWithTime(new Date(serviceStartDate), startHour, startMinute),
                                },
                            },
                            {
                                endTime: {
                                    lte: dateWithTime(new Date(servicEndDate), endHour, endMinute),
                                },
                            },
                        ],
                    },
                },
            },
            orderBy: { date: "asc" },
        });
        const parentSlotIds = fetchedSlots.map(s => s.id);
        const timeSlotIds = fetchedSlots
            .flatMap(s => s.AvailableSlotsTimeForService.map(ts => ts.id))
            .filter(Boolean);
        const startDate = new Date(serviceStartDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(servicEndDate);
        endDate.setHours(0, 0, 0, 0);
        const bufferDays = Number(dto.buffer) || 0;
        const rangeAStart = new Date(startDate);
        rangeAStart.setDate(rangeAStart.getDate() - bufferDays);
        rangeAStart.setHours(0, 0, 0, 0);
        const rangeAEnd = new Date(startDate);
        rangeAEnd.setHours(23, 59, 59, 999);
        const rangeBStart = new Date(startDate);
        rangeBStart.setHours(0, 0, 0, 0);
        const rangeBEnd = new Date(endDate);
        rangeBEnd.setDate(rangeBEnd.getDate() + bufferDays);
        rangeBEnd.setHours(23, 59, 59, 999);
        const txOps = [];
        if (timeSlotIds.length > 0) {
            txOps.push(this.prisma.availableSlotsTimeForService.updateMany({
                where: { id: { in: timeSlotIds } },
                data: { availabe: false },
            }));
        }
        if (parentSlotIds.length > 0) {
            txOps.push(this.prisma.availableSlotsForService.updateMany({
                where: { id: { in: parentSlotIds } },
                data: { availabe: false, isBooked: true },
            }));
        }
        txOps.push(this.prisma.availableSlotsForService.updateMany({
            where: {
                date: {
                    gte: rangeAStart,
                    lte: rangeAEnd,
                },
            },
            data: { availabe: false },
        }));
        txOps.push(this.prisma.availableSlotsForService.updateMany({
            where: {
                date: {
                    gte: rangeBStart,
                    lte: rangeBEnd,
                },
            },
            data: { availabe: false },
        }));
        await this.prisma.$transaction(txOps);
        const intake = await this.prisma.intakeForm.create({
            data: {
                startDate: new Date(serviceStartDate),
                endDate: new Date(servicEndDate),
                name,
                email,
                phone,
                address,
                location,
                regionId: region.id,
                servicePricingId: service.id,
                doulaProfileId: doulaProfileId,
                clientId: clientprofile.id,
                slot: {
                    connect: parentSlotIds.map(id => ({ id }))
                },
                slotTime: {
                    connect: timeSlotIds.map(id => ({ id }))
                }
            },
        });
        const booking = await this.prisma.serviceBooking.create({
            data: {
                startDate: new Date(serviceStartDate),
                endDate: new Date(servicEndDate),
                regionId: region.id,
                servicePricingId: service.id,
                doulaProfileId: doulaProfileId,
                clientId: clientprofile.id,
                slot: {
                    connect: timeSlotIds.map(id => ({ id }))
                },
                AvailableSlotsForService: {
                    connect: parentSlotIds.map(id => ({ id }))
                }
            }
        });
        console.log("intake form", intake);
        const booked = await this.prisma.availableSlotsForService.findMany({
            where: { id: { in: parentSlotIds } },
            include: {
                AvailableSlotsTimeForService: {
                    where: { id: { in: timeSlotIds } }
                }
            }
        });
        const scheduleRecords = booked.flatMap(parent => {
            return parent.AvailableSlotsTimeForService.map(child => ({
                date: parent.date,
                startTime: child.startTime,
                endTime: child.endTime,
                doulaProfileId: doulaProfileId,
                serviceId: service.id,
                clientId: clientprofile.id,
            }));
        });
        await this.prisma.schedules.createMany({
            data: scheduleRecords
        });
        return { intake, booking };
    }
};
exports.IntakeFormService = IntakeFormService;
exports.IntakeFormService = IntakeFormService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_1.MailerService])
], IntakeFormService);
//# sourceMappingURL=intake-forms.service.js.map