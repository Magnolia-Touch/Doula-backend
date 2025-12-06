import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
import { paginate } from 'src/common/utility/pagination.util';

import {
    findRegionOrThrow,
    findServiceOrThrowwithId,
    findSlotOrThrow,
    findUserOrThrowwithId,
    findZoneManagerOrThrowWithId,
    getOrcreateClent,
} from 'src/common/utility/service-utils';

import { MailerService } from '@nestjs-modules/mailer';
import { Role } from '@prisma/client';
import { MeetingsService } from 'src/meetings/meetings.service';

@Injectable()
export class EnquiryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mail: MailerService,
        private readonly schedule: MeetingsService,
    ) { }

    // --------------------------------------------------------------
    //  1️⃣  CREATE / SUBMIT ENQUIRY
    // --------------------------------------------------------------
    async submitEnquiry(data: EnquiryFormDto) {
        // create meeting instance - done
        // slot Lock-- done
        // create client-- done, take client email from here.add meeting history to client 
        // add meeting history to zone manager or doula profile
        // send mail to zone manager and user
        // //client is created while submiting the enquiry form. might be useful for followup
        // const client = await createClent(this.prisma, data)

        const { regionId, timeId, serviceId, name, email, phone, additionalNotes } = data;
        const client = await getOrcreateClent(this.prisma, data)
        const profile = await this.prisma.clientProfile.findUnique({
            where: { userId: client.id }
        })
        if (!profile) { throw new NotFoundException("profile not found") }
        // 1. Validate Region
        const region = await findRegionOrThrow(this.prisma, regionId);
        // 2. Validate Slot
        const slot = await findSlotOrThrow(this.prisma, timeId);
        // Prevent double booking
        if (slot.isBooked == true || slot.availabe === false) {
            throw new BadRequestException('This slot is already booked');
        }
        // 3. Validate Service
        const service = await findServiceOrThrowwithId(this.prisma, serviceId);
        if (!region.zoneManagerId) {
            throw new BadRequestException("Region does not have a zone manager assigned");
        }
        // 4. Get Zone Manager
        const zoneManager = await findZoneManagerOrThrowWithId(
            this.prisma,
            region.zoneManagerId,
        );
        // 5. Get User (manager email)
        //Every User have two table- one user table(to store common) and one profile table
        const zoneMngrssertbldata = await findUserOrThrowwithId(
            this.prisma,
            zoneManager.userId || '',
        );
        // 7. Create Enquiry
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
        const enquiryForm = { email: enquiry.email, slotId: enquiry.slotId, additionalNotes: enquiry.additionalNotes, name: service.name }
        //create meeting
        console.log(enquiry)
        const meeting = await this.schedule.scheduleMeeting(enquiryForm, client.clientProfile.id, zoneManager.id, Role.ZONE_MANAGER, slot.dateId)
        // 6. Lock slot
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: timeId },
            data: { isBooked: true, availabe: false },
        });
        // 8. Send Mail
        // await this.mail.sendMail({
        //     to: zoneMngrssertbldata.email,
        //     subject: `New Enquiry from ${name}`,
        //     template: 'enquiry',
        //     context: {
        //         name,
        //         phone_number: phone,
        //         email,
        //         message: `A client has shown interest in ${service.name} and booked a meeting slot.`,
        //     },
        // });
        return {
            message: 'Enquiry submitted successfully',
            enquiry,
        };
    }

    // --------------------------------------------------------------
    //  2️⃣  GET ALL ENQUIRIES (with pagination)
    // --------------------------------------------------------------
    async getAllEnquiries(page: number = 1, limit: number = 10) {
        return paginate({
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

    // --------------------------------------------------------------
    //  3️⃣  GET ENQUIRY BY ID
    // --------------------------------------------------------------
    async getEnquiryById(id: string) {
        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id },
            include: {
                region: true,
                service: true,
                slot: true,
            },
        });

        if (!enquiry) {
            throw new NotFoundException('Enquiry not found');
        }

        return enquiry;
    }

    // --------------------------------------------------------------
    //  4️⃣  DELETE ENQUIRY (auto-unlock slot)
    // --------------------------------------------------------------
    async deleteEnquiry(id: string) {
        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id },
        });

        if (!enquiry) {
            throw new NotFoundException('Enquiry not found');
        }

        // Unlock slot
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: enquiry.slotId },
            data: { isBooked: false },
        });

        // Delete enquiry
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
}
