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
        const { regionId, timeId, serviceId, name, email, phone, additionalNotes } = data;
        const client = await (0, service_utils_1.getOrcreateClent)(this.prisma, data);
        const profile = await this.prisma.clientProfile.findUnique({
            where: { userId: client.id }
        });
        if (!profile) {
            throw new common_1.NotFoundException("profile not found");
        }
        const region = await (0, service_utils_1.findRegionOrThrow)(this.prisma, regionId);
        const slot = await (0, service_utils_1.findSlotOrThrow)(this.prisma, timeId);
        if (slot.isBooked == true || slot.availabe === false) {
            throw new common_1.BadRequestException('This slot is already booked');
        }
        const service = await (0, service_utils_1.findServiceOrThrowwithId)(this.prisma, serviceId);
        if (!region.zoneManagerId) {
            throw new common_1.BadRequestException("Region does not have a zone manager assigned");
        }
        const zoneManager = await (0, service_utils_1.findZoneManagerOrThrowWithId)(this.prisma, region.zoneManagerId);
        const zoneMngrssertbldata = await (0, service_utils_1.findUserOrThrowwithId)(this.prisma, zoneManager.userId || '');
        const enquiry = await this.prisma.enquiryForm.create({
            data: {
                regionId,
                slotId: timeId,
                serviceId: service.id,
                name,
                email,
                phone,
                additionalNotes,
                startDate: data.startDate,
                endDate: data.endDate,
                TimeSlots: data.timeSlots,
                VisitFrequency: data.visitFrequency,
                clientId: profile.id
            },
        });
        const enquiryForm = { email: enquiry.email, slotId: enquiry.slotId, additionalNotes: enquiry.additionalNotes, name: service.name };
        console.log(enquiry);
        const meeting = await this.schedule.scheduleMeeting(enquiryForm, client.clientProfile.id, zoneManager.id, client_1.Role.ZONE_MANAGER, slot.dateId);
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: timeId },
            data: { isBooked: true, availabe: false },
        });
        return {
            message: 'Enquiry submitted successfully',
            enquiry,
        };
    }
    async getAllEnquiries(page = 1, limit = 10) {
        return (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.enquiryForm,
            page,
            limit,
            orderBy: { createdAt: 'desc' },
            include: {
                region: true,
                service: true,
                slot: true,
            },
        });
    }
    async getEnquiryById(id) {
        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id },
            include: {
                region: true,
                service: true,
                slot: true,
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
            message: "All enquiry forms deleted successfully",
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