import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
import { paginate } from 'src/common/utility/pagination.util';
import {
  generateVisitDates,
  getOrcreateClent,
  isOverlapping,
} from 'src/common/utility/service-utils';
import { MailerService } from '@nestjs-modules/mailer';
import { Prisma, WeekDays } from '@prisma/client';

type IntakeFormWithRelations = Prisma.IntakeFormGetPayload<{
  include: {
    region: { select: { regionName: true } };
    service: {
      select: {
        price: true;
        service: { select: { name: true } };
      };
    };
    clientProfile: {
      select: {
        id: true;
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            phone: true;
          };
        };
      };
    };
    DoulaProfile: {
      select: {
        id: true;
        user: { select: { id: true } };
      };
    };
  };
}>;

@Injectable()
export class IntakeFormService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailerService,
  ) {}

  async createIntakeForm(dto: IntakeFormDto) {
    const {
      name,
      email,
      phone,
      doulaProfileId,
      serviceId,
      address,
      buffer = 0,
      seviceStartDate,
      serviceEndDate,
      visitFrequency,
      serviceTimeSlots,
    } = dto;

    /* ----------------------------------------------------
     * 1. Get or create client
     * -------------------------------------------------- */
    const clientUser = await getOrcreateClent(this.prisma, {
      name,
      email,
      phone,
    });

    const clientProfile = await this.prisma.clientProfile.update({
      where: { userId: clientUser.id },
      data: { address },
    });

    /* ----------------------------------------------------
     * 3. Validate region
     * -------------------------------------------------- */
    const region = await this.prisma.region.findFirst({
      where: { doula: { some: { id: doulaProfileId } } },
    });

    if (!region) {
      throw new BadRequestException('Region not listed for doula');
    }

    /* ----------------------------------------------------
     * 4. Validate service
     * -------------------------------------------------- */
    const service = await this.prisma.servicePricing.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    /* ----------------------------------------------------
     * 5. Normalize service dates
     * -------------------------------------------------- */
    const startDate = new Date(seviceStartDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(serviceEndDate);
    endDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      throw new BadRequestException('Invalid service date range');
    }

    /* ----------------------------------------------------
     * 6. Parse time slot "09:00-11:00"
     * -------------------------------------------------- */
    const [startStr, endStr] = serviceTimeSlots.split('-');
    const slotStartTime = new Date(`1970-01-01T${startStr}:00`);
    const slotEndTime = new Date(`1970-01-01T${endStr}:00`);

    if (slotStartTime >= slotEndTime) {
      throw new BadRequestException('Invalid time slot');
    }
    const DAY_TO_WEEKDAY: Record<number, WeekDays> = {
      0: WeekDays.SUNDAY,
      1: WeekDays.MONDAY,
      2: WeekDays.TUESDAY,
      3: WeekDays.WEDNESDAY,
      4: WeekDays.THURSDAY,
      5: WeekDays.FRIDAY,
      6: WeekDays.SATURDAY,
    };

    /* ----------------------------------------------------
     * 7. Generate visit dates
     * -------------------------------------------------- */
    const visitDates = await generateVisitDates(
      startDate,
      endDate,
      visitFrequency,
      buffer,
    );

    const schedulesToCreate: any[] = [];

    /* ----------------------------------------------------
     * 8. Validate availability + conflicts per date
     * -------------------------------------------------- */
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

      if (!daySlot || !daySlot.availabe) continue;

      const hasTimeSlot = daySlot.AvailableSlotsTimeForService.some((ts) =>
        isOverlapping(slotStartTime, slotEndTime, ts.startTime, ts.endTime),
      );

      if (!hasTimeSlot) continue;

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

      if (conflict) continue;

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
      throw new BadRequestException(
        'No valid schedules available for the selected dates and time slot',
      );
    }

    /* ----------------------------------------------------
     * 9. Atomic write
     * -------------------------------------------------- */
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

  async getAllForms(page: number, limit: number) {
    const result = await paginate({
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

    // 🔑 Explicitly tell TS what `form` really is
    const data = (result.data as IntakeFormWithRelations[]).map((form) => ({
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

  async getFormById(id: string) {
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
      throw new NotFoundException('Intake form not found');
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
      message: 'All enquiry forms deleted successfully',
      deletedCount: result.count,
    };
  }

  async BookDoula(dto: BookDoulaDto, userId: string) {
    const {
      name,
      email,
      phone,
      location,
      address,
      doulaProfileId,
      serviceId,
      serviceStartDate,
      servicEndDate,
      visitFrequency,
      timeSlots,
    } = dto;

    /* ----------------------------------------------------
     * 1. Update client profile
     * -------------------------------------------------- */
    const clientProfile = await this.prisma.clientProfile.update({
      where: { userId },
      data: { address },
    });

    /* ----------------------------------------------------
     * 2. Validate region
     * -------------------------------------------------- */
    const region = await this.prisma.region.findFirst({
      where: { doula: { some: { id: doulaProfileId } } },
    });

    if (!region) {
      throw new BadRequestException('Region not listed for doula');
    }

    /* ----------------------------------------------------
     * 3. Validate service
     * -------------------------------------------------- */
    const service = await this.prisma.servicePricing.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    /* ----------------------------------------------------
     * 4. Parse time slot (09:00-11:00)
     * -------------------------------------------------- */
    const [startStr, endStr] = timeSlots.split('-');

    const slotStartTime = new Date(`1970-01-01T${startStr}:00`);
    const slotEndTime = new Date(`1970-01-01T${endStr}:00`);

    if (slotStartTime >= slotEndTime) {
      throw new BadRequestException('Invalid time slot');
    }

    /* ----------------------------------------------------
     * 5. Normalize service dates
     * -------------------------------------------------- */
    const startDate = new Date(serviceStartDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(servicEndDate);
    endDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      throw new BadRequestException('Invalid service date range');
    }

    /* ----------------------------------------------------
     * 6. Generate visit dates
     * -------------------------------------------------- */
    const BUFFER_DAYS = 0;

    const visitDates = await generateVisitDates(
      startDate,
      endDate,
      visitFrequency,
      BUFFER_DAYS,
    );

    const schedulesToCreate: any[] = [];
    const DAY_TO_WEEKDAY: Record<number, WeekDays> = {
      0: WeekDays.SUNDAY,
      1: WeekDays.MONDAY,
      2: WeekDays.TUESDAY,
      3: WeekDays.WEDNESDAY,
      4: WeekDays.THURSDAY,
      5: WeekDays.FRIDAY,
      6: WeekDays.SATURDAY,
    };

    /* ----------------------------------------------------
     * 7. Validate availability + conflicts per date
     * -------------------------------------------------- */
    for (const visitDate of visitDates) {
      const weekday = DAY_TO_WEEKDAY[visitDate.getDay()];

      /* Fetch weekday availability */
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

      if (!daySlot || !daySlot.availabe) continue;

      /* Check time-slot availability */
      const hasTimeAvailability = daySlot.AvailableSlotsTimeForService.some(
        (ts) =>
          isOverlapping(slotStartTime, slotEndTime, ts.startTime, ts.endTime),
      );

      if (!hasTimeAvailability) continue;

      /* Check schedule conflicts */
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

      if (conflict) continue;

      /* Schedule is valid */
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
      throw new BadRequestException(
        'No valid schedules available for the selected dates and time slot',
      );
    }

    /* ----------------------------------------------------
     * 8. Atomic write
     * -------------------------------------------------- */
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
}
