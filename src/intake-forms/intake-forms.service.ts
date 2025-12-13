import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
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
        const { name, email, phone, doulaProfileId, serviceId, address, buffer, enquiryId } = dto
        const data = { name: dto.name, email: dto.email, phone: dto.phone }
        const client = await getOrcreateClent(this.prisma, data)

        // Update client address
        const clientprofile = await this.prisma.clientProfile.update({
            where: { userId: client.id },
            data: { address: dto.address },
        });

        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id: dto.enquiryId },
            select: { endDate: true, startDate: true, VisitFrequency: true, TimeSlots: true }
        });
        if (!enquiry) { throw new BadRequestException("Enquiry not Found") }


        const region = await this.prisma.region.findFirst({
            where: { doula: { some: { id: dto.doulaProfileId } } }
        })
        if (!region) { throw new BadRequestException("Region not listed for doula") }


        const service = await this.prisma.servicePricing.findUnique({
            where: { id: dto.serviceId }
        })
        if (!service) {
            throw new NotFoundException('Service Not Found');
        }


        // build date of services.
        const leftEndDate = new Date(enquiry.startDate);
        const rightEndDate = new Date(enquiry.endDate);

        const dates: Date[] = [];
        let current = new Date(leftEndDate);

        while (current <= rightEndDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + enquiry.VisitFrequency);
        }

        //parse timeslot "09:00-11:00"
        const [startStr, endStr] = enquiry.TimeSlots.split("-");
        const [startHour, startMinute] = startStr.split(":").map(Number);
        const [endHour, endMinute] = endStr.split(":").map(Number);

        // Helper to produce DateTime for a given date with hours/minutes
        function dateWithTime(date: Date, hour: number, minute: number) {
            const d = new Date(date);
            d.setHours(hour, minute, 0, 0);
            return d;
        }

        // 3) fetch matching AvailableSlotsForService with only the matching child timeslots
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

        // 4) collect ids to update
        const parentSlotIds = fetchedSlots.map(s => s.id);

        // Flatten all matching time-slot ids (may be empty arrays)
        const timeSlotIds = fetchedSlots
            .flatMap(s => s.AvailableSlotsTimeForService.map(ts => ts.id))
            .filter(Boolean);

        // 5) compute buffer ranges (dates are compared as DateTimes; truncate to start-of-day)
        const startDate = new Date(enquiry.startDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(enquiry.endDate);
        endDate.setHours(0, 0, 0, 0);

        const bufferDays = Number(dto.buffer) || 0;

        // Range A: enquiry.startDate - buffer  → enquiry.startDate (inclusive)
        const rangeAStart = new Date(startDate);
        rangeAStart.setDate(rangeAStart.getDate() - bufferDays); // startDate - buffer
        rangeAStart.setHours(0, 0, 0, 0);
        const rangeAEnd = new Date(startDate); // upto startDate inclusive
        rangeAEnd.setHours(23, 59, 59, 999);

        // Range B: enquiry.startDate → enquiry.endDate + buffer (inclusive)
        const rangeBStart = new Date(startDate);
        rangeBStart.setHours(0, 0, 0, 0);
        const rangeBEnd = new Date(endDate);
        rangeBEnd.setDate(rangeBEnd.getDate() + bufferDays);
        rangeBEnd.setHours(23, 59, 59, 999);

        // 6) perform updates in a single transaction for consistency
        const txOps = [] as any[];

        // If there are matching child timeslots, mark their availabe = false
        if (timeSlotIds.length > 0) {
            txOps.push(
                this.prisma.availableSlotsTimeForService.updateMany({
                    where: { id: { in: timeSlotIds } },
                    data: { availabe: false },
                })
            );
        }

        // Mark the fetched parent slots as availabe = false and isBooked = true
        if (parentSlotIds.length > 0) {
            txOps.push(
                this.prisma.availableSlotsForService.updateMany({
                    where: { id: { in: parentSlotIds } },
                    data: { availabe: false, isBooked: true },
                })
            );
        }

        // Buffer range A: set availabe = false (do NOT change isBooked)
        txOps.push(
            this.prisma.availableSlotsForService.updateMany({
                where: {
                    date: {
                        gte: rangeAStart,
                        lte: rangeAEnd,
                    },
                },
                data: { availabe: false },
            })
        );

        // Buffer range B: set availabe = false (do NOT change isBooked)
        txOps.push(
            this.prisma.availableSlotsForService.updateMany({
                where: {
                    date: {
                        gte: rangeBStart,
                        lte: rangeBEnd,
                    },
                },
                data: { availabe: false },
            })
        );


        // Execute transaction
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

                // Connect selected days
                slot: {
                    connect: parentSlotIds.map(id => ({ id }))
                },

                // Connect selected time ranges
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

                // connect time slots booked
                slot: {
                    connect: timeSlotIds.map(id => ({ id }))
                },

                // connect parent date slots booked
                AvailableSlotsForService: {
                    connect: parentSlotIds.map(id => ({ id }))
                }
            }
        });
        console.log("intake form", intake)

        // fetch all slots that were just booked (i.e., the ones we connected)
        const booked = await this.prisma.availableSlotsForService.findMany({
            where: { id: { in: parentSlotIds } },
            include: {
                AvailableSlotsTimeForService: {
                    where: { id: { in: timeSlotIds } }   // only these times
                }
            }
        });

        // build schedules payload
        const scheduleRecords = booked.flatMap(parent => {
            return parent.AvailableSlotsTimeForService.map(child => ({
                date: parent.date,                   // parent date
                startTime: child.startTime,          // child time
                endTime: child.endTime,

                doulaProfileId: doulaProfileId,
                serviceId: service.id,
                clientId: clientprofile.id,
            }))
        });

        // insert in bulk
        await this.prisma.schedules.createMany({
            data: scheduleRecords
        });

        //create schedules for each of slots marked isBooked = true
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
        // // Unlock slot
        // await this.prisma.availableSlotsForService.update({
        //     where: { id: intake.slotId },
        //     data: { isBooked: false, availabe: true },
        // });

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


    async BookDoula(dto: BookDoulaDto, userId: string) {
        const { name, email, phone, location, address, doulaProfileId, serviceId, serviceStartDate, servicEndDate, visitFrequency, timeSlots, buffer } = dto

        // const data = { name: dto.name, email: dto.email, phone: dto.phone }
        // const client = await getOrcreateClent(this.prisma, data)
        // Update client address
        const clientprofile = await this.prisma.clientProfile.update({
            where: { userId: userId },
            data: { address: dto.address },
        });

        const region = await this.prisma.region.findFirst({
            where: { doula: { some: { id: doulaProfileId } } }
        })
        if (!region) { throw new BadRequestException("Region not listed for doula") }


        const service = await this.prisma.servicePricing.findUnique({
            where: { id: serviceId }
        })
        if (!service) {
            throw new NotFoundException('Service Not Found');
        }

        // build date of services.
        const leftEndDate = new Date(serviceStartDate);
        const rightEndDate = new Date(servicEndDate);

        const dates: Date[] = [];
        let current = new Date(leftEndDate);

        while (current <= rightEndDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + visitFrequency);
        }

        //parse timeslot "09:00-11:00"
        const [startStr, endStr] = timeSlots.split("-");
        const [startHour, startMinute] = startStr.split(":").map(Number);
        const [endHour, endMinute] = endStr.split(":").map(Number);

        // Helper to produce DateTime for a given date with hours/minutes
        function dateWithTime(date: Date, hour: number, minute: number) {
            const d = new Date(date);
            d.setHours(hour, minute, 0, 0);
            return d;
        }

        // 3) fetch matching AvailableSlotsForService with only the matching child timeslots
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

        // 4) collect ids to update
        const parentSlotIds = fetchedSlots.map(s => s.id);

        // Flatten all matching time-slot ids (may be empty arrays)
        const timeSlotIds = fetchedSlots
            .flatMap(s => s.AvailableSlotsTimeForService.map(ts => ts.id))
            .filter(Boolean);

        // 5) compute buffer ranges (dates are compared as DateTimes; truncate to start-of-day)
        const startDate = new Date(serviceStartDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(servicEndDate);
        endDate.setHours(0, 0, 0, 0);

        const bufferDays = Number(dto.buffer) || 0;

        // Range A: enquiry.startDate - buffer  → enquiry.startDate (inclusive)
        const rangeAStart = new Date(startDate);
        rangeAStart.setDate(rangeAStart.getDate() - bufferDays); // startDate - buffer
        rangeAStart.setHours(0, 0, 0, 0);
        const rangeAEnd = new Date(startDate); // upto startDate inclusive
        rangeAEnd.setHours(23, 59, 59, 999);

        // Range B: enquiry.startDate → enquiry.endDate + buffer (inclusive)
        const rangeBStart = new Date(startDate);
        rangeBStart.setHours(0, 0, 0, 0);
        const rangeBEnd = new Date(endDate);
        rangeBEnd.setDate(rangeBEnd.getDate() + bufferDays);
        rangeBEnd.setHours(23, 59, 59, 999);

        // 6) perform updates in a single transaction for consistency
        const txOps = [] as any[];

        // If there are matching child timeslots, mark their availabe = false
        if (timeSlotIds.length > 0) {
            txOps.push(
                this.prisma.availableSlotsTimeForService.updateMany({
                    where: { id: { in: timeSlotIds } },
                    data: { availabe: false },
                })
            );
        }

        // Mark the fetched parent slots as availabe = false and isBooked = true
        if (parentSlotIds.length > 0) {
            txOps.push(
                this.prisma.availableSlotsForService.updateMany({
                    where: { id: { in: parentSlotIds } },
                    data: { availabe: false, isBooked: true },
                })
            );
        }

        // Buffer range A: set availabe = false (do NOT change isBooked)
        txOps.push(
            this.prisma.availableSlotsForService.updateMany({
                where: {
                    date: {
                        gte: rangeAStart,
                        lte: rangeAEnd,
                    },
                },
                data: { availabe: false },
            })
        );

        // Buffer range B: set availabe = false (do NOT change isBooked)
        txOps.push(
            this.prisma.availableSlotsForService.updateMany({
                where: {
                    date: {
                        gte: rangeBStart,
                        lte: rangeBEnd,
                    },
                },
                data: { availabe: false },
            })
        );


        // Execute transaction
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

                // Connect selected days
                slot: {
                    connect: parentSlotIds.map(id => ({ id }))
                },

                // Connect selected time ranges
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

                // connect time slots booked
                slot: {
                    connect: timeSlotIds.map(id => ({ id }))
                },

                // connect parent date slots booked
                AvailableSlotsForService: {
                    connect: parentSlotIds.map(id => ({ id }))
                }
            }
        });
        console.log("intake form", intake)

        // fetch all slots that were just booked (i.e., the ones we connected)
        const booked = await this.prisma.availableSlotsForService.findMany({
            where: { id: { in: parentSlotIds } },
            include: {
                AvailableSlotsTimeForService: {
                    where: { id: { in: timeSlotIds } }   // only these times
                }
            }
        });

        // build schedules payload
        const scheduleRecords = booked.flatMap(parent => {
            return parent.AvailableSlotsTimeForService.map(child => ({
                date: parent.date,                   // parent date
                startTime: child.startTime,          // child time
                endTime: child.endTime,

                doulaProfileId: doulaProfileId,
                serviceId: service.id,
                clientId: clientprofile.id,
            }))
        });

        // insert in bulk
        await this.prisma.schedules.createMany({
            data: scheduleRecords
        });

        //create schedules for each of slots marked isBooked = true
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

}
