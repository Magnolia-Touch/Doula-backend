import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
import { paginate } from 'src/common/utility/pagination.util';
import { getWeekdayFromDate, isMeetingExists } from 'src/common/utility/service-utils';

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
import { error } from 'console';

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

        // 
        // 
        // take availablemeetinginstance with date and weekday 
        // check if the meetingsTimeSlots is free by checking the meeting table with date, starttime, endtime.if not availale throw error
        // if no meeting exist for selected meetingsTimeSlots, create a meeting instance.
        const {
            name, email, phone, regionId, meetingsDate, meetingsTimeSlots,
            serviceId, seviceStartDate, serviceEndDate, visitFrequency,
            serviceTimeSlots, additionalNotes
        } = data;

        const client = await getOrcreateClent(this.prisma, data)
        const profile = await this.prisma.clientProfile.findUnique({
            where: { userId: client.id }
        })
        if (!profile) { throw new NotFoundException("profile not found") }

        // weekday is taken from Date
        const weekday = await getWeekdayFromDate(meetingsDate)
        console.log("weekday", weekday)

        // doulaId is taken from region of regionId. 
        const region = await findRegionOrThrow(this.prisma, regionId);
        if (!region.zoneManagerId) {
            throw new BadRequestException("Region does not have a zone manager assigned");
        }
        // Get Zone Manager
        const zoneManager = await findZoneManagerOrThrowWithId(
            this.prisma,
            region.zoneManagerId,
        );

        // Get User (manager email)
        //Every User have two table- one user table(to store common) and one profile table
        // const zoneMngrssertbldata = await findUserOrThrowwithId(
        //     this.prisma,
        //     zoneManager.userId || '',
        // );

        // 2. Validate Slot
        const slot = await findSlotOrThrow(this.prisma, {
            ownerRole: Role.ZONE_MANAGER,
            ownerProfileId: region.zoneManagerId,
            weekday,
        });

        console.log("slot", slot)

        const exists = await isMeetingExists(
            this.prisma,
            new Date(meetingsDate),
            meetingsTimeSlots,
            {
                zoneManagerProfileId: region.zoneManagerId,
            },
        );

        if (exists) {
            throw new BadRequestException('Meeting already exists for this time slot');
        }
        // 3. Validate Service
        const service = await findServiceOrThrowwithId(this.prisma, serviceId);

        // 7. Create Enquiry
        const enquiry = await this.prisma.enquiryForm.create({
            data: {
                name,
                email,
                phone,
                additionalNotes,
                meetingsDate: new Date(meetingsDate),
                meetingsTimeSlots: meetingsTimeSlots,
                seviceStartDate: new Date(seviceStartDate),
                serviceEndDate: new Date(serviceEndDate),
                VisitFrequency: visitFrequency,
                serviceTimeSlots: serviceTimeSlots,
                serviceName: service.name,
                regionId,
                slotId: slot.id,
                serviceId: service.id,
                clientId: profile.id
            },
        });

        const [startTime, endTime] = meetingsTimeSlots.split('-');

        if (!startTime || !endTime) {
            throw new Error('Invalid time slot format. Expected HH:mm-HH:mm');
        }
        const startDateTime = new Date(`${meetingsDate}T${startTime}:00`);
        const endDateTime = new Date(`${meetingsDate}T${endTime}:00`);

        const enquiryData = { email: enquiry.email, startTime: startDateTime, endTime: endDateTime, date: new Date(meetingsDate), additionalNotes: enquiry.additionalNotes, serviceName: service.name }
        console.log("enquiry data", enquiryData)
        const meeting = await this.schedule.scheduleMeeting(enquiryData, client.clientProfile.id, zoneManager.id, Role.ZONE_MANAGER, slot.id)

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
    async getAllEnquiries(page = 1, limit = 10) {
        return paginate({
            prismaModel: this.prisma.enquiryForm,
            page,
            limit,
            orderBy: { createdAt: 'desc' },
        });
    }


    // --------------------------------------------------------------
    //  3️⃣  GET ENQUIRY BY ID
    // --------------------------------------------------------------
    async getEnquiryById(id: string) {
        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id },
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
                serviceId: true,
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
