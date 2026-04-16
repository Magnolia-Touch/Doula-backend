import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
import { paginate } from 'src/common/utility/pagination.util';
import {
  areWeekdaysPresentBetweenDates,
  daysBetween,
  generateVisitDatesforBirthDoula,
  generateVisitDatesforPostPartumDoula,
  getOrcreateClent,
  getPriceForShift,
  isDoulaAvailableForShift,
  isDoulaOffOnShift,
  isOverlapping,
} from 'src/common/utility/service-utils';
import { MailService } from 'src/mail/mail.service';
import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ServiceStatus,
  TimeShift,
  WeekDays,
} from '@prisma/client';
import { StripeService } from 'src/stripe/stripe.service';
import { Console } from 'console';
import { formatDate } from 'date-fns/format';
import { Attachment } from 'nodemailer/lib/mailer';
import path from 'path';
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
  private readonly logger = new Logger(IntakeFormService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private stripeService: StripeService,
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
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
    );
  }

  private roundToNearestMultipleOf5(amount: number): number {
    return Math.round(amount / 5) * 5;
  }

  private async getUserCommissionPercentage(userId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ commission: number }>>`
      SELECT commission FROM ClientProfile WHERE userId = ${userId} LIMIT 1
    `;
    return result?.[0]?.commission ?? 10;
  }

  private async updateUserCommissionPercentage(
    userId: string,
    commissionPercentage: number,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE ClientProfile SET commission = ${commissionPercentage} WHERE userId = ${userId}
    `;
  }

  /**
   * Shift conflict rules (mirrors getBookedDatesInRange logic):
   *
   * Same-day:
   *   - Any shift already booked → entire day is blocked (one shift per day)
   *
   * Cross-day (previous day's schedule affects current day):
   *   - Previous day NIGHT or FULLDAY → blocks current MORNING and FULLDAY
   */
  private async isShiftBlockedByExistingSchedules(
    doulaProfileId: string,
    visitDate: Date,
    targetShift: TimeShift,
  ): Promise<{ blocked: boolean; reason?: string }> {
    const prevDate = new Date(visitDate);
    prevDate.setUTCDate(prevDate.getUTCDate() - 1);

    const schedules = await this.prisma.schedules.findMany({
      where: {
        doulaProfileId,
        date: { in: [visitDate, prevDate] },
        status: { not: ServiceStatus.CANCELED },
      },
      select: { date: true, timeshift: true },
    });

    const visitDateKey = visitDate.toISOString().split('T')[0];
    const prevDateKey = prevDate.toISOString().split('T')[0];

    const sameDayShifts = new Set<string>();
    const prevDayShifts = new Set<string>();

    for (const s of schedules) {
      const key = this.toUtcMidnight(s.date).toISOString().split('T')[0];
      if (key === visitDateKey) sameDayShifts.add(s.timeshift);
      if (key === prevDateKey) prevDayShifts.add(s.timeshift);
    }

    // Same-day: only one shift allowed per day
    if (sameDayShifts.size > 0) {
      return { blocked: true, reason: 'Doula already has a shift booked on this date' };
    }

    // Cross-day: previous day NIGHT or FULLDAY → blocks current MORNING and FULLDAY
    if (
      (targetShift === 'MORNING' || targetShift === 'FULLDAY') &&
      (prevDayShifts.has('NIGHT') || prevDayShifts.has('FULLDAY'))
    ) {
      return { blocked: true, reason: `Cannot book ${targetShift} - doula had NIGHT/FULLDAY previous day` };
    }

    return { blocked: false };
  }

  async createIntakeForm(dto: IntakeFormDto) {
    const {
      name,
      email,
      phone,
      address,
      serviceHours,
      doulaProfileId,
      serviceId,
      buffer = 0,
      serviceStartDate,
      serviceEndDate,
      visitDays,
      serviceTimeShift,
      commissionPercentage,
      startTime,
    } = dto;

    if (visitDays) {
      const diffDays = areWeekdaysPresentBetweenDates(
        new Date(serviceStartDate),
        new Date(serviceEndDate as string),
        visitDays,
      );
      if (!diffDays) {
        throw new BadRequestException(
          'Weekday Selected not available within the dates choosen',
        );
      }
    }
    /* ----------------------------------------------------
     * 1. Get or create client
     * -------------------------------------------------- */
    const clientUser = await getOrcreateClent(this.prisma, {
      name,
      email,
      phone,
    });

    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId: clientUser.id },
      include: { user: true },
    });
    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
    }
    if (clientProfile.user.is_active === false) {
      throw new BadRequestException('Client profile is inactive');
    }

    let resolvedCommissionPercentage = 10;
    if (commissionPercentage !== undefined && commissionPercentage !== null) {
      resolvedCommissionPercentage = commissionPercentage;
      await this.updateUserCommissionPercentage(
        clientUser.id,
        commissionPercentage,
      );
    } else {
      resolvedCommissionPercentage = await this.getUserCommissionPercentage(
        clientUser.id,
      );
    }

    /* ----------------------------------------------------
     * 2. Validate region
     * -------------------------------------------------- */
    const region = await this.prisma.region.findFirst({
      where: { doula: { some: { id: doulaProfileId } } },
      include: { zoneManager: { include: { user: true } } },
    });
    console.log('helo', region);
    if (!region) {
      throw new BadRequestException('Region not listed for doula');
    }
    if (region.is_active === false) {
      throw new BadRequestException('Region is inactive');
    }
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { id: doulaProfileId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            phone: true,
            is_active: true,
          },
        },
      },
    });

    if (!doula) {
      throw new NotFoundException('Doula profile not found');
    }
    if (doula.user.is_active === false) {
      throw new BadRequestException('Doula is inactive');
    }
    /* ----------------------------------------------------
     * 3. Validate service pricing
     * -------------------------------------------------- */
    const servicePricing = await this.prisma.servicePricing.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        price: true,
        service: { select: { name: true } },
      },
    });

    if (!servicePricing) {
      throw new NotFoundException('Service not found');
    }

    /* ----------------------------------------------------
     * 4. Normalize dates
     * -------------------------------------------------- */
    const startDate = this.toUtcMidnight(serviceStartDate);
    const endDate = serviceEndDate
      ? this.toUtcMidnight(serviceEndDate)
      : undefined;

    if (endDate && startDate > endDate) {
      throw new BadRequestException('Invalid service date range');
    }

    /* ----------------------------------------------------
     * 5. Generate visit dates (same as BookDoula)
     * -------------------------------------------------- */
    let visitDates: Date[];
    visitDates =
      servicePricing.service.name === 'Post Partum Doula'
        ? await generateVisitDatesforPostPartumDoula(
          startDate,
          endDate,
          visitDays,
        )
        : await generateVisitDatesforBirthDoula(startDate, buffer);

    if (!visitDates.length) {
      throw new BadRequestException('No valid visit dates generated');
    }

    console.log(visitDates);
    /* ----------------------------------------------------
     * 6. Availability validation — skip conflicting dates
     * -------------------------------------------------- */
    const skippedDates: { date: string; reason: string }[] = [];
    const availableDates: Date[] = [];

    for (const visitDate of visitDates) {
      const dateStr = visitDate.toISOString().split('T')[0];

      if (
        await isDoulaOffOnShift(doulaProfileId, visitDate, serviceTimeShift)
      ) {
        skippedDates.push({
          date: dateStr,
          reason: 'Doula is off on this date',
        });
        continue;
      }

      if (
        !(await isDoulaAvailableForShift(
          doulaProfileId,
          visitDate,
          serviceTimeShift,
        ))
      ) {
        skippedDates.push({
          date: dateStr,
          reason: 'Doula not available for this shift',
        });
        continue;
      }

      const shiftBlock = await this.isShiftBlockedByExistingSchedules(
        doulaProfileId,
        visitDate,
        serviceTimeShift,
      );

      if (shiftBlock.blocked) {
        skippedDates.push({
          date: dateStr,
          reason: shiftBlock.reason || 'Doula already booked on this date',
        });
        continue;
      }

      availableDates.push(visitDate);
    }

    if (!availableDates.length) {
      throw new BadRequestException(
        'No available dates for booking. All requested dates are already booked or unavailable.',
      );
    }
    let totalAmount = 0;
    let payableAmount = 0;
    const resolvedServiceHours =
      servicePricing.service.name === 'Birth Doula' ? 16 : serviceHours;
    if (servicePricing.service.name === 'Birth Doula') {
      const hourlyRate = getPriceForShift(
        servicePricing.price,
        TimeShift.FULLDAY,
      );
      totalAmount = hourlyRate * resolvedServiceHours;
    } else if (servicePricing.service.name === 'Post Partum Doula') {
      const hourlyRate = getPriceForShift(
        servicePricing.price,
        serviceTimeShift,
      );
      totalAmount = hourlyRate * resolvedServiceHours * availableDates.length;
    }

    totalAmount =
      totalAmount +
      (totalAmount * resolvedCommissionPercentage) / 100;

    totalAmount = this.roundToNearestMultipleOf5(totalAmount);

    if (totalAmount <= 0) {
      throw new BadRequestException('Invalid total amount');
    }
    payableAmount = totalAmount;
    if (totalAmount >= 1000) {
      const half = totalAmount / 2;
      payableAmount = Math.min(half, 1000);
    }

    payableAmount = this.roundToNearestMultipleOf5(payableAmount);

    const resolvedTimeShift: TimeShift =
      servicePricing.service.name === 'Post Partum Doula'
        ? serviceTimeShift
        : TimeShift.FULLDAY;
    /* ----------------------------------------------------
     * 7. Create intake + booking + schedules (transaction)
     * -------------------------------------------------- */
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
          startTime,
          regionId: region.id,
          servicePricingId: servicePricing.id,
          doulaProfileId,
          serviceHours: resolvedServiceHours,
          clientId: clientProfile.id,
          status: BookingStatus.ACTIVE,
          isPaid: true, // IMPORTANT: intake flow assumes confirmed booking
          totalAmount: String(totalAmount),
          amountPaid: String(payableAmount),
          timeshift: resolvedTimeShift,
        },
      });

      await tx.schedules.createMany({
        data: availableDates.map((date) => ({
          date,
          startTime,
          timeshift: resolvedTimeShift,
          doulaProfileId,
          serviceId: servicePricing.id,
          clientId: clientProfile.id,
          serviceHours: resolvedServiceHours,
          bookingId: booking.id,
          status: ServiceStatus.IN_PROGRESS
        })),
      });

      return { intake, booking };
    });

    console.log('helo', region.zoneManager, region.zoneManager?.user);
    if (region.zoneManager == null || region.zoneManager.user == null) {
      throw new BadRequestException('Region not listed for doula');
    }
    //mail to doula like from zone manager

    //mail to doula like from client
    // ---------------- MAIL DEBUGGING START ----------------
    this.logger.log(
      `[IntakeMail] Starting email notifications | booking=${result.booking.id}`,
    );

    try {
      /* ----------------------------------------------------
       * Zone Manager Email
       * -------------------------------------------------- */
      this.logger.log(
        `[IntakeMail] Sending email to ZONE MANAGER | to=${region.zoneManager.user.email}`,
      );

      await this.mail.sendMail({
        to: region.zoneManager.user.email,
        subject: 'New Booking Confirmed – Region Notification',
        template: 'zone-manager-booking-notification',
        context: {
          appName: 'Bambini Doula',
          year: new Date().getFullYear(),
          resolvedTimeShift,
          clientName: clientProfile.user.name,
          clientEmail: clientProfile.user.email,
          clientPhone: clientProfile.user.phone,
          doulaName: doula.user.name,
          doulaEmail: doula.user.email,
          doulaPhone: doula.user.phone,
          serviceName: servicePricing.service.name,
          serviceStartDate: formatDate(new Date(startDate), 'yyyy-MM-dd'),
          serviceEndDate: endDate
            ? formatDate(new Date(endDate), 'yyyy-MM-dd')
            : undefined,
          timeShift: resolvedTimeShift,
          regionName: region.regionName,
          totalAmount,
          payableAmount,
        },
      });

      this.logger.log(`[IntakeMail] Zone Manager email SENT successfully`);

      const commonContext = {
        appName: 'Bambini Doula',
        year: new Date().getFullYear(),
        serviceName: servicePricing.service.name,
        region: region.regionName,
        timeShift: resolvedTimeShift,
        serviceStartDate: formatDate(new Date(startDate), 'yyyy-MM-dd'),
        serviceEndDate: endDate
          ? formatDate(new Date(endDate), 'yyyy-MM-dd')
          : undefined,
        AmountPaid: payableAmount,
        totalAmount: totalAmount,
      };

      /* ----------------------------------------------------
       * Doula Email
       * -------------------------------------------------- */
      this.logger.log(
        `[IntakeMail] Sending email to DOULA | to=${doula.user.email}`,
      );

      await this.mail.sendMail({
        to: doula.user.email,
        subject: 'New Booking Assigned – Bambini Doula',
        template: 'doula-booking-confirmation',
        context: {
          ...commonContext,
          clientName: clientProfile.user.name,
          clientEmail: clientProfile.user.email,
          clientPhone: clientProfile.user.phone,
        },
      });

      this.logger.log(`[IntakeMail] Doula email SENT successfully`);

      /* ----------------------------------------------------
       * Client Email
       * -------------------------------------------------- */
      const attachments = this.getServiceAttachments(
        servicePricing.service.name,
      );

      this.logger.log(
        `[IntakeMail] Client email | to=${clientProfile.user.email} | attachments=${attachments.length}`,
      );

      if (attachments.length > 0) {
        this.logger.log(`[IntakeMail] Sending client email WITH attachments`);

        await this.mail.sendMailWithAttachments({
          to: clientProfile.user.email,
          subject: 'Your Booking is Confirmed – Bambini Doula',
          template: 'client-booking-confirmation',
          context: {
            ...commonContext,
            clientName: clientProfile.user.name,
            doulaName: doula.user.name,
            doulaEmail: doula.user.email,
            doulaPhone: doula.user.phone,
          },
          attachments,
        });

        this.logger.log(
          `[IntakeMail] Client email (with attachments) SENT successfully`,
        );
      } else {
        this.logger.log(
          `[IntakeMail] Sending client email WITHOUT attachments`,
        );

        await this.mail.sendMail({
          to: clientProfile.user.email,
          subject: 'Your Booking is Confirmed – Bambini Doula',
          template: 'client-booking-confirmation',
          context: {
            ...commonContext,
            clientName: clientProfile.user.name,
            doulaName: doula.user.name,
            doulaEmail: doula.user.email,
            doulaPhone: doula.user.phone,
          },
        });

        this.logger.log(
          `[IntakeMail] Client email (no attachments) SENT successfully`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[IntakeMail] EMAIL FAILURE | booking=${result.booking.id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Booking completed, but confirmation email failed. Please contact support.',
      );
    }
    // ---------------- MAIL DEBUGGING END ----------------

    /* ----------------------------------------------------
     * 8. Response
     * -------------------------------------------------- */
    return {
      message: 'Intake form created and schedules booked successfully',
      intakeId: result.intake.id,
      bookingId: result.booking.id,
      scheduledDates: availableDates.map((d) => d.toISOString().split('T')[0]),
      skippedDates,
      totalAmount,
      payableAmount,
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
      address,
      serviceHours,
      doulaProfileId,
      serviceId,
      serviceStartDate,
      servicEndDate,
      visitDays,
      serviceTimeShift,
      buffer,
      startTime,
      successUrl,
      cancelUrl,
    } = dto;

    if (visitDays) {
      const diffDays = areWeekdaysPresentBetweenDates(
        new Date(serviceStartDate),
        new Date(servicEndDate as string),
        visitDays,
      );
      if (!diffDays) {
        throw new BadRequestException(
          'Weekday Selected not available within the dates choosen',
        );
      }
    }

    /* ----------------------------------------------------
     * 1. Fetch user & client profile
     * -------------------------------------------------- */
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        is_active: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_active === false) {
      throw new BadRequestException('User is inactive');
    }

    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
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

    if (region.is_active === false) {
      throw new BadRequestException('Region is inactive');
    }
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { id: doulaProfileId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            phone: true,
            is_active: true,
          },
        },
      },
    });
    if (!doula) {
      throw new NotFoundException('Doula profile not found');
    }
    if (doula.user.is_active === false) {
      throw new BadRequestException('Doula is inactive');
    }
    /* ----------------------------------------------------
     * 3. Validate service pricing
     * -------------------------------------------------- */
    const servicePricing = await this.prisma.servicePricing.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        price: true,
        service: { select: { name: true } },
      },
    });

    if (!servicePricing) {
      throw new NotFoundException('Service not found');
    }

    if (servicePricing.service.name == 'Birth Doula' && servicEndDate) {
      throw new BadRequestException('Deselect ServiceEnd Date for Birth Doula');
    }
    // end date is optinal
    /* ----------------------------------------------------
     * 4. Normalize dates
     * -------------------------------------------------- */
    const startDate = this.toUtcMidnight(serviceStartDate);
    const endDate = servicEndDate
      ? this.toUtcMidnight(servicEndDate)
      : undefined;

    if (endDate && startDate > endDate) {
      throw new BadRequestException('Invalid service date range');
    }

    /* ----------------------------------------------------
     * 5. Generate visit dates
     * -------------------------------------------------- */
    // visitdaets calculate if end date is availble
    let visitDates: Date[];

    visitDates =
      servicePricing.service.name === 'Post Partum Doula'
        ? await generateVisitDatesforPostPartumDoula(
          startDate,
          endDate,
          visitDays,
        )
        : await generateVisitDatesforBirthDoula(startDate, buffer);

    if (!visitDates.length) {
      throw new BadRequestException('No valid visit dates generated');
    }

    console.log('visitDates', visitDates);

    /* ----------------------------------------------------
     * 6. Availability validation — skip conflicting dates
     * -------------------------------------------------- */
    console.log('visitdates', visitDates);
    const skippedDates: { date: string; reason: string }[] = [];
    const availableDates: Date[] = [];

    for (const visitDate of visitDates) {
      const dateStr = visitDate.toISOString().split('T')[0];

      if (
        await isDoulaOffOnShift(doulaProfileId, visitDate, serviceTimeShift)
      ) {
        skippedDates.push({
          date: dateStr,
          reason: 'Doula is off on this date',
        });
        continue;
      }

      if (
        !(await isDoulaAvailableForShift(
          doulaProfileId,
          visitDate,
          serviceTimeShift,
        ))
      ) {
        skippedDates.push({
          date: dateStr,
          reason: 'Doula not available for this shift',
        });
        continue;
      }

      const shiftBlock = await this.isShiftBlockedByExistingSchedules(
        doulaProfileId,
        visitDate,
        serviceTimeShift,
      );

      if (shiftBlock.blocked) {
        skippedDates.push({
          date: dateStr,
          reason: shiftBlock.reason || 'Doula already booked on this date',
        });
        continue;
      }

      availableDates.push(visitDate);
    }

    if (!availableDates.length) {
      throw new BadRequestException(
        'No available dates for booking. All requested dates are already booked or unavailable.',
      );
    }

    // /* ----------------------------------------------------
    //  * 7. Prevent duplicate unpaid bookings
    //  * -------------------------------------------------- */
    // const pendingBooking = await this.prisma.serviceBooking.findFirst({
    //   where: {
    //     clientId: clientProfile.id,
    //     doulaProfileId,
    //     servicePricingId: servicePricing.id,
    //     isPaid: false,
    //   },
    // });

    // if (pendingBooking) {
    //   throw new BadRequestException(
    //     'You already have a pending booking. Complete payment first.',
    //   );
    // }

    /* ----------------------------------------------------
     * 8. Price calculation
     * -------------------------------------------------- */
    let totalAmount = 0;
    let payableAmount = 0;
    const resolvedServiceHours =
      servicePricing.service.name === 'Birth Doula' ? 16 : serviceHours;
    if (servicePricing.service.name === 'Birth Doula') {
      const hourlyRate = getPriceForShift(
        servicePricing.price,
        TimeShift.FULLDAY,
      );
      totalAmount = hourlyRate * resolvedServiceHours;
    } else if (servicePricing.service.name === 'Post Partum Doula') {
      const hourlyRate = getPriceForShift(
        servicePricing.price,
        serviceTimeShift,
      );
      totalAmount = hourlyRate * resolvedServiceHours * availableDates.length;
    }

    const resolvedCommissionPercentage = await this.getUserCommissionPercentage(
      userId,
    );
    totalAmount =
      totalAmount +
      (totalAmount * resolvedCommissionPercentage) / 100;

    totalAmount = this.roundToNearestMultipleOf5(totalAmount);

    console.log('servicename', servicePricing.service.name);
    console.log('totalamount', totalAmount);
    if (totalAmount <= 0) {
      throw new BadRequestException('Invalid total amount');
    }
    payableAmount = totalAmount;
    if (totalAmount >= 1000) {
      const half = totalAmount / 2;
      payableAmount = Math.min(half, 1000);
    }

    payableAmount = this.roundToNearestMultipleOf5(payableAmount);
    console.log(payableAmount);
    console.log('payable type', typeof payableAmount);
    console.log('totalamoutn type', typeof totalAmount);
    /* ----------------------------------------------------
     * 10. Create booking + payment (transaction)
     * -------------------------------------------------- */
    const resolvedTimeShift: TimeShift =
      servicePricing.service.name === 'Post Partum Doula'
        ? serviceTimeShift
        : TimeShift.FULLDAY;

    const { booking, payment } = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.serviceBooking.create({
        data: {
          startDate,
          endDate,
          startTime,
          regionId: region.id,
          servicePricingId: servicePricing.id,
          doulaProfileId,
          serviceHours: resolvedServiceHours,
          clientId: clientProfile.id,
          status: BookingStatus.PENDING,
          isPaid: false,
          totalAmount: String(totalAmount),
          amountPaid: String(payableAmount),
          timeshift: resolvedTimeShift,
        },
      });
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          clientId: clientProfile.id,
          amount: payableAmount,
          currency: 'USD',
          status: PaymentStatus.PENDING,
          provider: PaymentProvider.STRIPE,
          metadata: {
            // Booking identifiers
            bookingId: booking.id,
            servicePricingId: servicePricing.id,
            doulaProfileId,
            clientId: clientProfile.id,

            // Client details
            clientName: user.name,
            clientEmail: user.email,
            clientPhone: user.phone,

            // Service details
            serviceName: servicePricing.service.name,
            serviceStartDate: startDate.toISOString(),
            serviceEndDate: endDate?.toISOString(),
            startTime,
            timeShift: resolvedTimeShift,
            visitDates: availableDates.map((d) => d.toISOString()),

            // Region details
            regionId: region.id,
            regionName: region.regionName,

            // Doula details
            doulaName: doula?.user.name,
            doulaEmail: doula?.user?.email,
            doulaPhone: doula?.user.phone,

            // Payment details
            totalAmount: totalAmount,
            amountPaid: payableAmount,   // ✅ ADD THIS
            currency: 'USD',
          },
        },
      });

      return { booking, payment };
    });

    console.log('hi deva, i am here');
    /* ----------------------------------------------------
     * 11. Create Stripe checkout (OUTSIDE transaction)
     * -------------------------------------------------- */
    const checkoutSession =
      await this.stripeService.createCheckoutLinkForBooking(
        booking,
        payment,
        user.email,
        successUrl || this.getDefaultUrl('/booking/success'),
        cancelUrl || this.getDefaultUrl('/booking/cancel'),
      );

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutSessionId: checkoutSession.id },
    });

    /* ----------------------------------------------------
     * 12. Response
     * -------------------------------------------------- */
    return {
      message: 'Booking created. Complete payment to confirm.',
      bookingId: booking.id,
      paymentId: payment.id,
      amount: totalAmount,
      payableAmount: payableAmount,
      currency: 'USD',
      checkout_url: checkoutSession.url,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      scheduledDates: availableDates.map((d) => d.toISOString().split('T')[0]),
      skippedDates,
    };
  }

  private getServiceAttachments(serviceName: string): Attachment[] {
    const normalized = serviceName.trim().toLowerCase();

    const basePath = path.join(process.cwd(), 'assets');

    if (normalized === 'birth doula') {
      return [
        {
          filename: 'Birth-Doula-Contract.pdf',
          path: path.join(basePath, 'Birth-Doula-Contract.pdf'),
          contentType: 'application/pdf',
        },
      ];
    }

    if (
      normalized === 'post partum doula' ||
      normalized === 'postpartum doula'
    ) {
      return [
        {
          filename: 'Postpartum-Contract.pdf',
          path: path.join(basePath, 'Postpartum-Contract.pdf'),
          contentType: 'application/pdf',
        },
      ];
    }

    return [];
  }
}
