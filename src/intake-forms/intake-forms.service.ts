import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
import { paginate } from 'src/common/utility/pagination.util';
import {
  generateVisitDatesforBirthDoula,
  generateVisitDatesforPostPartumDoula,
  getOrcreateClent,
  isDoulaAvailableForShift,
  isDoulaOffOnShift,
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
  ) { }



  private ensureHttpsUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }

  private getDefaultUrl(path: string): string {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is not set');
    }
    const baseUrl = this.ensureHttpsUrl(frontendUrl);
    return `${baseUrl}${path}`;
  }

  private toUtcMidnight(date: Date | string): Date {
    const d = new Date(date);
    return new Date(Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      0, 0, 0, 0
    ));
  }




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
      serviceTimeShift,
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
      select:
      {
        id: true,
        service: { select: { id: true, name: true } }
      }
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    /* ----------------------------------------------------
     * 5. Normalize service dates
     * -------------------------------------------------- */
    const startDate = this.toUtcMidnight(seviceStartDate);
    const endDate = this.toUtcMidnight(serviceEndDate);

    if (startDate > endDate) {
      throw new BadRequestException('Invalid service date range');
    }
    console.log('RAW INPUT:', seviceStartDate);
    console.log(
      'PARSED DATE:',
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
    );

    const currentDate = new Date(startDate);


    const lastDate = new Date(endDate);


    //section of checking availbility

    //section of checking availbility
    const visitDates =
      service.service.name === 'Post Partum Doula'
        ? await generateVisitDatesforPostPartumDoula(startDate, endDate, visitFrequency)
        : await generateVisitDatesforBirthDoula(startDate, endDate, buffer);

    for (const visitDate of visitDates) {
      const isOff = await isDoulaOffOnShift(
        doulaProfileId,
        visitDate,
        serviceTimeShift,
      );

      if (isOff) {
        throw new BadRequestException(
          `Doula has marked ${serviceTimeShift} off on ${visitDate.toISOString().split('T')[0]}`,
        );
      }

      const isAvailable = await isDoulaAvailableForShift(
        doulaProfileId,
        visitDate,
        serviceTimeShift,
      );

      if (!isAvailable) {
        throw new BadRequestException(
          `Doula is not available on ${visitDate.toISOString().split('T')[0]} for ${serviceTimeShift}`,
        );
      }

      const schedule = await this.prisma.schedules.findFirst({
        where: {
          doulaProfileId,
          date: visitDate,
          timeshift: serviceTimeShift,
        },
      });

      if (schedule) {
        throw new BadRequestException(
          `Doula already booked on ${visitDate.toISOString().split('T')[0]}`
        );
      }
    }

    if (service.service.name == "Birth Doula") {
      const schedulesToCreate: any[] = [];
      const visitDates = await generateVisitDatesforBirthDoula(
        startDate,
        endDate,
        buffer,
      );

      for (const visitDate of visitDates) {
        schedulesToCreate.push({
          date: visitDate,
          timeshift: serviceTimeShift,
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
            servicePricingId: service.id,
            doulaProfileId,
            clientId: clientProfile.id,
          },
        });
        const booking = await tx.serviceBooking.create({
          data: {
            startDate,
            endDate,
            regionId: region.id,
            servicePricingId: service.id,
            doulaProfileId,
            clientId: clientProfile.id,
          },
        });
        await tx.schedules.createMany({
          data: schedulesToCreate.map((schedule) => ({
            ...schedule,
            bookingId: booking.id,
          })),
        });

        return { intake, booking };
      });
    }
    else if (service.service.name == "Post Partum Doula") {
      const schedulesToCreate: any[] = [];
      const visitDates = await generateVisitDatesforPostPartumDoula(
        startDate,
        endDate,
        visitFrequency
      );

      for (const visitDate of visitDates) {
        schedulesToCreate.push({
          date: visitDate,
          timeshift: serviceTimeShift,
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
            servicePricingId: service.id,
            doulaProfileId,
            clientId: clientProfile.id,
          },
        });
        const booking = await tx.serviceBooking.create({
          data: {
            startDate,
            endDate,
            regionId: region.id,
            servicePricingId: service.id,
            doulaProfileId,
            clientId: clientProfile.id,
          },
        });
        await tx.schedules.createMany({
          data: schedulesToCreate.map((schedule) => ({
            ...schedule,
            bookingId: booking.id,
          })),
        });

        return { intake, booking };
      });
    }
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
      serviceTimeShift,
      buffer
    } = dto;

    /* ----------------------------------------------------
     * 1. Update client profile
     * -------------------------------------------------- */
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!clientProfile) {
      throw new NotFoundException("client not found")
    }

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
      select:
      {
        id: true,
        service: { select: { id: true, name: true } }
      }
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    /* ----------------------------------------------------
     * 5. Normalize service dates
     * -------------------------------------------------- */

    const startDate = this.toUtcMidnight(serviceStartDate);
    const endDate = this.toUtcMidnight(servicEndDate);

    if (startDate > endDate) {
      throw new BadRequestException('Invalid service date range');
    }
    console.log('RAW INPUT:', serviceStartDate);
    console.log(
      'PARSED DATE:',
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
    );

    //section of checking availbility
    const visitDates =
      service.service.name === 'Post Partum Doula'
        ? await generateVisitDatesforPostPartumDoula(startDate, endDate, visitFrequency)
        : await generateVisitDatesforBirthDoula(startDate, endDate, buffer);

    for (const visitDate of visitDates) {
      const isOff = await isDoulaOffOnShift(
        doulaProfileId,
        visitDate,
        serviceTimeShift,
      );

      if (isOff) {
        throw new BadRequestException(
          `Doula has marked ${serviceTimeShift} off on ${visitDate.toISOString().split('T')[0]}`,
        );
      }

      const isAvailable = await isDoulaAvailableForShift(
        doulaProfileId,
        visitDate,
        serviceTimeShift,
      );

      if (!isAvailable) {
        throw new BadRequestException(
          `Doula is not available on ${visitDate.toISOString().split('T')[0]} for ${serviceTimeShift}`,
        );
      }

      const schedule = await this.prisma.schedules.findFirst({
        where: {
          doulaProfileId,
          date: visitDate,
          timeshift: serviceTimeShift,
        },
      });

      if (schedule) {
        throw new BadRequestException(
          `Doula already booked on ${visitDate.toISOString().split('T')[0]}`
        );
      }
    }

    if (service.service.name == "Birth Doula") {
      const schedulesToCreate: any[] = [];
      const visitDates = await generateVisitDatesforBirthDoula(
        startDate,
        endDate,
        buffer,
      );

      for (const visitDate of visitDates) {
        schedulesToCreate.push({
          date: visitDate,
          timeshift: serviceTimeShift,
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
            servicePricingId: service.id,
            doulaProfileId,
            clientId: clientProfile.id,
          },
        });
        const booking = await tx.serviceBooking.create({
          data: {
            startDate,
            endDate,
            regionId: region.id,
            servicePricingId: service.id,
            doulaProfileId,
            clientId: clientProfile.id,
          },
        });
        await tx.schedules.createMany({
          data: schedulesToCreate.map((schedule) => ({
            ...schedule,
            bookingId: booking.id,
          })),
        });

        return { intake, booking };
      });
    }
    else if (service.service.name == "Post Partum Doula") {
      const schedulesToCreate: any[] = [];
      const visitDates = await generateVisitDatesforPostPartumDoula(
        startDate,
        endDate,
        visitFrequency
      );

      for (const visitDate of visitDates) {
        schedulesToCreate.push({
          date: visitDate,
          timeshift: serviceTimeShift,
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
            servicePricingId: service.id,
            doulaProfileId,
            clientId: clientProfile.id,
          },
        });
        const booking = await tx.serviceBooking.create({
          data: {
            startDate,
            endDate,
            regionId: region.id,
            servicePricingId: service.id,
            doulaProfileId,
            clientId: clientProfile.id,
          },
        });
        await tx.schedules.createMany({
          data: schedulesToCreate.map((schedule) => ({
            ...schedule,
            bookingId: booking.id,
          })),
        });

        return { intake, booking };
      });
    }

  }
}
