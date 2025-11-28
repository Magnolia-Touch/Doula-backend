import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IntakeFormDto } from './dto/intake-form.dto';
import { paginate } from 'src/common/utility/pagination.util';
import { getOrcreateClent } from 'src/common/utility/service-utils';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class IntakeFormService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mail: MailerService,
    ) { }

    async createIntakeForm(dto: IntakeFormDto) {
        const { name, email, phone } = dto
        const data = { name: dto.name, email: dto.email, phone: dto.phone }
        const client = await getOrcreateClent(this.prisma, data)
        console.log("client", client)
        // Update client address
        const clientprofile = await this.prisma.clientProfile.update({
            where: { userId: client.id },
            data: { address: dto.address },
        });
        const region = await this.prisma.region.findFirst({
            where: { doula: { some: { id: dto.doulaProfileId } } }
        })
        if (!region) {
            throw new BadRequestException("Region not listed for doula")
        }
        // Slot validation
        const slot = await this.prisma.availableSlotsForService.findUnique({
            where: { id: dto.slotId }
        });

        if (!slot || !slot.availabe || slot.isBooked) {
            throw new BadRequestException('Selected slot is not available');
        }
        const service = await this.prisma.servicePricing.findUnique({
            where: { id: dto.serviceId }
        })
        if (!service) {
            throw new NotFoundException('Service Not Found');
        }

        const leftEndDate = new Date(slot.date);
        leftEndDate.setDate(slot.date.getDate() - dto.buffer);

        const rightEndDate = new Date(slot.date);
        rightEndDate.setDate(slot.date.getDate() + dto.buffer);
        // Create intake form
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

        console.log("intake form", intake)
        // Auto-create service booking
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
        console.log("intake form", intake)


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

        // await this.mail.sendMail({
        //     to: client.email,
        //     subject: `Confirmation of your service`,
        //     template: 'meetings',
        //     context: {
        //         date: dateInstance?.date,
        //         time: slot.startTime + ' - ' + slot.endTime,
        //         meetLink: meetLink,

        //     },
        // });
        return { intake, booking };
    }


    async getAllForms(page: number, limit: number) {
        return paginate({
            prismaModel: this.prisma.intakeForm,
            page,
            limit,
            include: { clientProfile: true, DoulaProfile: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getFormById(id: string) {
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

        if (!form) throw new NotFoundException('Intake form not found');
        return form;
    }

    async deleteForm(id: string) {
        const intake = await this.prisma.intakeForm.findUnique({
            where: { id },
        });

        if (!intake) {
            throw new NotFoundException('Intake not found');
        }
        // Unlock slot
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
}
