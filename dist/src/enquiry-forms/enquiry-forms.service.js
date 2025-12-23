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
exports.EnquiryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_util_1 = require("../common/utility/pagination.util");
const service_utils_1 = require("../common/utility/service-utils");
const service_utils_2 = require("../common/utility/service-utils");
const mailer_1 = require("@nestjs-modules/mailer");
const client_1 = require("@prisma/client");
const meetings_service_1 = require("../meetings/meetings.service");
let EnquiryService = class EnquiryService {
    prisma;
    mail;
    schedule;
    constructor(prisma, mail, schedule) {
        this.prisma = prisma;
        this.mail = mail;
        this.schedule = schedule;
    }
    async submitEnquiry(data) {
        const { name, email, phone, regionId, meetingsDate, meetingsTimeSlots, serviceId, seviceStartDate, serviceEndDate, visitFrequency, serviceTimeSlots, additionalNotes, } = data;
        const client = await (0, service_utils_2.getOrcreateClent)(this.prisma, data);
        const profile = await this.prisma.clientProfile.findUnique({
            where: { userId: client.id },
        });
        if (!profile) {
            throw new common_1.NotFoundException('profile not found');
        }
        const weekday = await (0, service_utils_1.getWeekdayFromDate)(meetingsDate);
        console.log('weekday', weekday);
        const region = await (0, service_utils_2.findRegionOrThrow)(this.prisma, regionId);
        if (!region.zoneManagerId) {
            throw new common_1.BadRequestException('Region does not have a zone manager assigned');
        }
        const zoneManager = await (0, service_utils_2.findZoneManagerOrThrowWithId)(this.prisma, region.zoneManagerId);
        const slot = await (0, service_utils_2.findSlotOrThrow)(this.prisma, {
            ownerRole: client_1.Role.ZONE_MANAGER,
            ownerProfileId: region.zoneManagerId,
            weekday,
        });
        console.log('slot', slot);
        const exists = await (0, service_utils_1.isMeetingExists)(this.prisma, new Date(meetingsDate), meetingsTimeSlots, {
            zoneManagerProfileId: region.zoneManagerId,
        });
        if (exists) {
            throw new common_1.BadRequestException('Meeting already exists for this time slot');
        }
        const service = await (0, service_utils_2.findServiceOrThrowwithId)(this.prisma, serviceId);
        const enquiry = await this.prisma.enquiryForm.create({
            data: {
                name,
                email,
                phone,
                additionalNotes,
                meetingsDate: new Date(meetingsDate),
                meetingsTimeSlots: meetingsTimeSlots,
                seviceStartDate: seviceStartDate ? new Date(seviceStartDate) : null,
                serviceEndDate: serviceEndDate ? new Date(serviceEndDate) : null,
                VisitFrequency: visitFrequency ? visitFrequency : null,
                serviceTimeSlots: serviceTimeSlots ? serviceTimeSlots : null,
                serviceName: service.name,
                regionId,
                slotId: slot.id,
                serviceId: service.id,
                clientId: profile.id,
            },
        });
        const [startTime, endTime] = meetingsTimeSlots.split('-');
        if (!startTime || !endTime) {
            throw new Error('Invalid time slot format. Expected HH:mm-HH:mm');
        }
        const startDateTime = new Date(`${meetingsDate}T${startTime}:00`);
        const endDateTime = new Date(`${meetingsDate}T${endTime}:00`);
        const enquiryData = {
            email: enquiry.email,
            startTime: startDateTime,
            endTime: endDateTime,
            date: new Date(meetingsDate),
            additionalNotes: enquiry.additionalNotes,
            serviceName: service.name,
        };
        console.log('enquiry data', enquiryData);
        const meeting = await this.schedule.scheduleMeeting(enquiryData, client.clientProfile.id, zoneManager.id, client_1.Role.ZONE_MANAGER, slot.id);
        await enquiry.meetingsId === meeting.id;
        return {
            message: 'Enquiry submitted successfully',
            enquiry,
        };
    }
    async getAllEnquiries(page = 1, limit = 10, userId) {
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.enquiryForm,
            page,
            limit,
            orderBy: { createdAt: 'desc' },
            where: { region: { zoneManager: { userId: userId } } },
        });
    }
    async getEnquiryById(id, userId) {
        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id, region: { zoneManager: { userId: userId } } },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                additionalNotes: true,
                meetingsDate: true,
                meetingsTimeSlots: true,
                seviceStartDate: true,
                serviceEndDate: true,
                VisitFrequency: true,
                serviceTimeSlots: true,
                serviceName: true,
                createdAt: true,
                updatedAt: true,
                regionId: true,
                slotId: true,
                clientId: true,
                serviceId: true,
                meetingsId: true,
            },
        });
        if (!enquiry) {
            throw new common_1.NotFoundException('Enquiry not found');
        }
        return enquiry;
    }
    async deleteEnquiry(id) {
        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id },
        });
        if (!enquiry) {
            throw new common_1.NotFoundException('Enquiry not found');
        }
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: enquiry.slotId },
            data: { isBooked: false },
        });
        await this.prisma.enquiryForm.delete({
            where: { id },
        });
        return { message: 'Enquiry deleted successfully and slot unlocked' };
    }
    async deleteAllEnquiryForms() {
        const result = await this.prisma.enquiryForm.deleteMany({});
        return {
            message: 'All enquiry forms deleted successfully',
            deletedCount: result.count,
        };
    }
};
exports.EnquiryService = EnquiryService;
exports.EnquiryService = EnquiryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_1.MailerService,
        meetings_service_1.MeetingsService])
], EnquiryService);
//# sourceMappingURL=enquiry-forms.service.js.map