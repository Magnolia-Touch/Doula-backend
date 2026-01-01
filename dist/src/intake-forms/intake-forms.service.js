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
const stripe_service_1 = require("../stripe/stripe.service");
let IntakeFormService = class IntakeFormService {
    prisma;
    mail;
    stripeService;
    constructor(prisma, mail, stripeService) {
        this.prisma = prisma;
        this.mail = mail;
        this.stripeService = stripeService;
    }
    ensureHttpsUrl(url) {
        if (!url)
            return url;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    }
    getDefaultUrl(path) {
        const frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) {
            throw new Error('FRONTEND_URL environment variable is not set');
        }
        const baseUrl = this.ensureHttpsUrl(frontendUrl);
        return `${baseUrl}${path}`;
    }
    toUtcMidnight(date) {
        const d = new Date(date);
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
    }
    async createIntakeForm(dto) {
        const { name, email, phone, address, doulaProfileId, serviceId, buffer = 0, seviceStartDate, serviceEndDate, visitFrequency, serviceTimeShift, } = dto;
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
        const servicePricing = await this.prisma.servicePricing.findUnique({
            where: { id: serviceId },
            select: {
                id: true,
                service: { select: { name: true } },
            },
        });
        if (!servicePricing) {
            throw new common_1.NotFoundException('Service not found');
        }
        const startDate = this.toUtcMidnight(seviceStartDate);
        const endDate = this.toUtcMidnight(serviceEndDate);
        if (startDate > endDate) {
            throw new common_1.BadRequestException('Invalid service date range');
        }
        const visitDates = servicePricing.service.name === 'Post Partum Doula'
            ? await (0, service_utils_1.generateVisitDatesforPostPartumDoula)(startDate, endDate, visitFrequency)
            : await (0, service_utils_1.generateVisitDatesforBirthDoula)(startDate, endDate, buffer);
        if (!visitDates.length) {
            throw new common_1.BadRequestException('No valid visit dates generated');
        }
        console.log(visitDates);
        for (const visitDate of visitDates) {
            if (await (0, service_utils_1.isDoulaOffOnShift)(doulaProfileId, visitDate, serviceTimeShift)) {
                throw new common_1.BadRequestException(`Doula is off on ${visitDate.toISOString().split('T')[0]}`);
            }
            if (!(await (0, service_utils_1.isDoulaAvailableForShift)(doulaProfileId, visitDate, serviceTimeShift))) {
                throw new common_1.BadRequestException(`Doula not available on ${visitDate.toISOString().split('T')[0]}`);
            }
            const existingSchedule = await this.prisma.schedules.findFirst({
                where: {
                    doulaProfileId,
                    date: visitDate,
                    timeshift: serviceTimeShift,
                },
            });
            if (existingSchedule) {
                throw new common_1.BadRequestException(`Doula already booked on ${visitDate.toISOString().split('T')[0]}`);
            }
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const intake = await tx.intakeForm.create({
                data: {
                    name,
                    email,
                    phone,
                    address,
                    startDate,
                    endDate,
                    regionId: region.id,
                    servicePricingId: servicePricing.id,
                    doulaProfileId,
                    clientId: clientProfile.id,
                },
            });
            const booking = await tx.serviceBooking.create({
                data: {
                    startDate,
                    endDate,
                    regionId: region.id,
                    servicePricingId: servicePricing.id,
                    doulaProfileId,
                    clientId: clientProfile.id,
                    status: client_1.BookingStatus.ACTIVE,
                    isPaid: true,
                },
            });
            await tx.schedules.createMany({
                data: visitDates.map((date) => ({
                    date,
                    timeshift: serviceTimeShift,
                    doulaProfileId,
                    serviceId: servicePricing.id,
                    clientId: clientProfile.id,
                    bookingId: booking.id,
                })),
            });
            return { intake, booking };
        });
        return {
            message: 'Intake form created and schedules booked successfully',
            intakeId: result.intake.id,
            bookingId: result.booking.id,
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
            message: 'All enquiry forms deleted successfully',
            deletedCount: result.count,
        };
    }
    async BookDoula(dto, userId) {
        const { name, email, phone, address, doulaProfileId, serviceId, serviceStartDate, servicEndDate, visitFrequency, serviceTimeShift, buffer, successUrl, cancelUrl, } = dto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, phone: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const clientProfile = await this.prisma.clientProfile.findUnique({
            where: { userId },
        });
        if (!clientProfile) {
            throw new common_1.NotFoundException('Client profile not found');
        }
        const region = await this.prisma.region.findFirst({
            where: { doula: { some: { id: doulaProfileId } } },
        });
        if (!region) {
            throw new common_1.BadRequestException('Region not listed for doula');
        }
        const servicePricing = await this.prisma.servicePricing.findUnique({
            where: { id: serviceId },
            select: {
                id: true,
                price: true,
                service: { select: { name: true } },
            },
        });
        if (!servicePricing) {
            throw new common_1.NotFoundException('Service not found');
        }
        const startDate = this.toUtcMidnight(serviceStartDate);
        const endDate = this.toUtcMidnight(servicEndDate);
        if (startDate > endDate) {
            throw new common_1.BadRequestException('Invalid service date range');
        }
        const visitDates = servicePricing.service.name === 'Post Partum Doula'
            ? await (0, service_utils_1.generateVisitDatesforPostPartumDoula)(startDate, endDate, visitFrequency)
            : await (0, service_utils_1.generateVisitDatesforBirthDoula)(startDate, endDate, buffer);
        for (const visitDate of visitDates) {
            if (await (0, service_utils_1.isDoulaOffOnShift)(doulaProfileId, visitDate, serviceTimeShift)) {
                throw new common_1.BadRequestException(`Doula is off on ${visitDate.toISOString().split('T')[0]}`);
            }
            if (!(await (0, service_utils_1.isDoulaAvailableForShift)(doulaProfileId, visitDate, serviceTimeShift))) {
                throw new common_1.BadRequestException(`Doula not available on ${visitDate.toISOString().split('T')[0]}`);
            }
            const existingSchedule = await this.prisma.schedules.findFirst({
                where: {
                    doulaProfileId,
                    date: visitDate,
                    timeshift: serviceTimeShift,
                },
            });
            if (existingSchedule) {
                throw new common_1.BadRequestException(`Doula already booked on ${visitDate.toISOString().split('T')[0]}`);
            }
        }
        let totalAmount = 0;
        if (servicePricing.service.name === 'Birth Doula') {
            totalAmount = (0, service_utils_1.getPriceForShift)(servicePricing.price, client_1.TimeShift.FULLDAY);
        }
        else if (servicePricing.service.name === 'Post Partum Doula') {
            const perDayPrice = (0, service_utils_1.getPriceForShift)(servicePricing.price, serviceTimeShift);
            totalAmount = perDayPrice * visitDates.length;
        }
        if (totalAmount <= 0) {
            throw new common_1.BadRequestException('Invalid total amount');
        }
        const { booking, payment } = await this.prisma.$transaction(async (tx) => {
            const booking = await tx.serviceBooking.create({
                data: {
                    startDate,
                    endDate,
                    regionId: region.id,
                    servicePricingId: servicePricing.id,
                    doulaProfileId,
                    clientId: clientProfile.id,
                    status: client_1.BookingStatus.PENDING,
                    isPaid: false,
                    totalAmount: String(totalAmount),
                },
            });
            const payment = await tx.payment.create({
                data: {
                    bookingId: booking.id,
                    clientId: clientProfile.id,
                    amount: totalAmount,
                    currency: 'INR',
                    status: client_1.PaymentStatus.PENDING,
                    provider: client_1.PaymentProvider.STRIPE,
                    metadata: {
                        visitDates,
                        serviceTimeShift,
                        doulaProfileId,
                        servicePricingId: servicePricing.id,
                        clientId: clientProfile.id,
                    },
                },
            });
            return { booking, payment };
        });
        const checkoutSession = await this.stripeService.createCheckoutLinkForBooking(booking, payment, user.email, successUrl || this.getDefaultUrl('/booking/success'), cancelUrl || this.getDefaultUrl('/booking/cancel'));
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { checkoutSessionId: checkoutSession.id },
        });
        return {
            message: 'Booking created. Complete payment to confirm.',
            bookingId: booking.id,
            paymentId: payment.id,
            amount: totalAmount,
            currency: 'INR',
            checkout_url: checkoutSession.url,
            successUrl: successUrl,
            cancelUrl: cancelUrl
        };
    }
};
exports.IntakeFormService = IntakeFormService;
exports.IntakeFormService = IntakeFormService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_1.MailerService,
        stripe_service_1.StripeService])
], IntakeFormService);
//# sourceMappingURL=intake-forms.service.js.map