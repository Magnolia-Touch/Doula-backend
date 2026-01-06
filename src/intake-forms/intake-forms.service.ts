import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
import { paginate } from 'src/common/utility/pagination.util';
import {
  generateVisitDatesforBirthDoula,
  generateVisitDatesforPostPartumDoula,
  getOrcreateClent,
  getPriceForShift,
  isDoulaAvailableForShift,
  isDoulaOffOnShift,
  isOverlapping,
} from 'src/common/utility/service-utils';
import { MailService } from 'src/mail/mail.service';
import { BookingStatus, PaymentProvider, PaymentStatus, Prisma, TimeShift, WeekDays } from '@prisma/client';
import { StripeService } from 'src/stripe/stripe.service';
import { Console } from 'console';
import { formatDate } from 'date-fns/format';
import { Attachment } from 'nodemailer/lib/mailer';
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
      address,
      doulaProfileId,
      serviceId,
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

    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId: clientUser.id },
      include: { user: true },
    });
    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
    }

    /* ----------------------------------------------------
     * 2. Validate region
     * -------------------------------------------------- */
    const region = await this.prisma.region.findFirst({
      where: { doula: { some: { id: doulaProfileId } } },
      include: { zoneManager: { include: { user: true } } },
    });

    if (!region || region.zoneManager == null || region.zoneManager.user == null) {
      throw new BadRequestException('Region not listed for doula');
    }
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { id: doulaProfileId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!doula) {
      throw new NotFoundException('Doula profile not found');
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
    const startDate = this.toUtcMidnight(seviceStartDate);
    const endDate = this.toUtcMidnight(serviceEndDate);

    if (startDate > endDate) {
      throw new BadRequestException('Invalid service date range');
    }

    /* ----------------------------------------------------
     * 5. Generate visit dates (same as BookDoula)
     * -------------------------------------------------- */
    const visitDates =
      servicePricing.service.name === 'Post Partum Doula'
        ? await generateVisitDatesforPostPartumDoula(
          startDate,
          endDate,
          visitFrequency,
        )
        : await generateVisitDatesforBirthDoula(startDate, endDate, buffer);

    if (!visitDates.length) {
      throw new BadRequestException('No valid visit dates generated');
    }

    console.log(visitDates)
    /* ----------------------------------------------------
     * 6. Availability validation (same as BookDoula)
     * -------------------------------------------------- */
    for (const visitDate of visitDates) {
      if (
        await isDoulaOffOnShift(
          doulaProfileId,
          visitDate,
          serviceTimeShift,
        )
      ) {
        throw new BadRequestException(
          `Doula is off on ${visitDate.toISOString().split('T')[0]}`,
        );
      }

      if (
        !(await isDoulaAvailableForShift(
          doulaProfileId,
          visitDate,
          serviceTimeShift,
        ))
      ) {
        throw new BadRequestException(
          `Doula not available on ${visitDate.toISOString().split('T')[0]}`,
        );
      }

      const existingSchedule = await this.prisma.schedules.findFirst({
        where: {
          doulaProfileId,
          date: visitDate,
          timeshift: serviceTimeShift,
        },
      });

      if (existingSchedule) {
        throw new BadRequestException(
          `Doula already booked on ${visitDate.toISOString().split('T')[0]}`,
        );
      }
    }
    let totalAmount = 0;

    if (servicePricing.service.name === 'Birth Doula') {
      const perDayPrice = getPriceForShift(
        servicePricing.price,
        TimeShift.FULLDAY,
      );
      console.log(perDayPrice)
      console.log(visitDates.length)
      totalAmount = perDayPrice * (visitDates.length - (2 * buffer))
    } else if (servicePricing.service.name === 'Post Partum Doula') {
      const perDayPrice = getPriceForShift(
        servicePricing.price,
        serviceTimeShift,
      );
      console.log(perDayPrice)
      console.log(visitDates.length)
      totalAmount = (perDayPrice * visitDates.length)
    }

    if (totalAmount <= 0) {
      throw new BadRequestException('Invalid total amount');
    }

    // const half = totalAmount / 2;
    // totalAmount = Math.min(half, 1000);
    // totalAmount = Math.round(totalAmount * 100) / 100;

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
          regionId: region.id,
          servicePricingId: servicePricing.id,
          doulaProfileId,
          clientId: clientProfile.id,
          status: BookingStatus.ACTIVE,
          isPaid: true, // IMPORTANT: intake flow assumes confirmed booking
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

    //mail to doula like from zone manager

    //mail to doula like from client
    try {
      await this.mail.sendMail({
        to: region.zoneManager.user.email,
        subject: 'New Booking Confirmed – Region Notification',
        template: 'so-manager-booking-notification',
        context: {
          appName: 'Bambini Doula',
          year: new Date().getFullYear(),

          serviceTimeShift,

          clientName: clientProfile.user.name,
          clientEmail: clientProfile.user.email,
          clientPhone: clientProfile.user.phone,

          doulaName: doula?.user.name,
          doulaEmail: doula?.user.email,
          doulaPhone: doula?.user.phone,

          serviceName: servicePricing.service.name,
          serviceStartDate: formatDate(new Date(startDate), 'yyyy-MM-dd'),
          serviceEndDate: formatDate(new Date(endDate), 'yyyy-MM-dd'),
          timeShift: serviceTimeShift,

          regionName: region.regionName,
          totalAmount,
        },
      });
      const commonContext = {
        appName: 'Bambini Doula',
        year: new Date().getFullYear(),

        serviceName: servicePricing.service.name,
        region: region.regionName,
        timeShift: serviceTimeShift,
        serviceStartDate: formatDate(new Date(seviceStartDate), 'yyyy-MM-dd'),
        serviceEndDate: formatDate(new Date(serviceEndDate), 'yyyy-MM-dd'),

        totalAmountPaid: totalAmount,
      };

      /* ----------------------------------------------------
       * Mail to Doula (NO attachments)
       * -------------------------------------------------- */
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

      /* ----------------------------------------------------
       * Mail to Client (WITH conditional attachments)
       * -------------------------------------------------- */
      const attachments = this.getServiceAttachments(servicePricing.service.name);

      if (attachments.length > 0) {
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
      } else {
        // fallback (no attachment)
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
      }

    } catch (error) {
      throw new InternalServerErrorException(
        'Booking completed, but confirmation email failed. Please contact support.',
      );
    }
    /* ----------------------------------------------------
     * 8. Response
     * -------------------------------------------------- */
    return {
      message: 'Intake form created and schedules booked successfully',
      intakeId: result.intake.id,
      bookingId: result.booking.id,
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

  // async BookDoula(dto: BookDoulaDto, userId: string) {
  //   const {
  //     name,
  //     email,
  //     phone,
  //     location,
  //     address,
  //     doulaProfileId,
  //     serviceId,
  //     serviceStartDate,
  //     servicEndDate,
  //     visitFrequency,
  //     serviceTimeShift,
  //     buffer,
  //     successUrl,
  //     cancelUrl
  //   } = dto;

  //   /* ----------------------------------------------------
  //    * 1. Update client profile
  //    * -------------------------------------------------- */
  //   const userTable = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //     select: { id: true, email: true, name: true, phone: true }
  //   });
  //   if (!userTable) {
  //     throw new NotFoundException("client not found")
  //   }
  //   const clientProfile = await this.prisma.clientProfile.findUnique({
  //     where: { userId }
  //   });
  //   if (!clientProfile) {
  //     throw new NotFoundException("client not found")
  //   }

  //   /* ----------------------------------------------------
  //    * 2. Validate region
  //    * -------------------------------------------------- */
  //   const region = await this.prisma.region.findFirst({
  //     where: { doula: { some: { id: doulaProfileId } } },
  //   });

  //   if (!region) {
  //     throw new BadRequestException('Region not listed for doula');
  //   }

  //   /* ----------------------------------------------------
  //    * 3. Validate service
  //    * -------------------------------------------------- */
  //   const service = await this.prisma.servicePricing.findUnique({
  //     where: { id: serviceId },
  //     select:
  //     {
  //       id: true,
  //       price: true,
  //       service: { select: { id: true, name: true } }
  //     }
  //   });

  //   if (!service) {
  //     throw new NotFoundException('Service not found');
  //   }

  //   /* ----------------------------------------------------
  //    * 5. Normalize service dates
  //    * -------------------------------------------------- */

  //   const startDate = this.toUtcMidnight(serviceStartDate);
  //   const endDate = this.toUtcMidnight(servicEndDate);

  //   if (startDate > endDate) {
  //     throw new BadRequestException('Invalid service date range');
  //   }
  //   console.log('RAW INPUT:', serviceStartDate);
  //   console.log(
  //     'PARSED DATE:',
  //     startDate.getFullYear(),
  //     startDate.getMonth() + 1,
  //     startDate.getDate(),
  //   );

  //   //section of checking availbility
  //   const visitDates =
  //     service.service.name === 'Post Partum Doula'
  //       ? await generateVisitDatesforPostPartumDoula(startDate, endDate, visitFrequency)
  //       : await generateVisitDatesforBirthDoula(startDate, endDate, buffer);

  //   for (const visitDate of visitDates) {
  //     const isOff = await isDoulaOffOnShift(
  //       doulaProfileId,
  //       visitDate,
  //       serviceTimeShift,
  //     );

  //     if (isOff) {
  //       throw new BadRequestException(
  //         `Doula has marked ${serviceTimeShift} off on ${visitDate.toISOString().split('T')[0]}`,
  //       );
  //     }

  //     const isAvailable = await isDoulaAvailableForShift(
  //       doulaProfileId,
  //       visitDate,
  //       serviceTimeShift,
  //     );

  //     if (!isAvailable) {
  //       throw new BadRequestException(
  //         `Doula is not available on ${visitDate.toISOString().split('T')[0]} for ${serviceTimeShift}`,
  //       );
  //     }

  //     const schedule = await this.prisma.schedules.findFirst({
  //       where: {
  //         doulaProfileId,
  //         date: visitDate,
  //         timeshift: serviceTimeShift,
  //       },
  //     });

  //     if (schedule) {
  //       throw new BadRequestException(
  //         `Doula already booked on ${visitDate.toISOString().split('T')[0]}`
  //       );
  //     }
  //   }

  //   if (service.service.name == "Birth Doula") {
  //     let totalAmount: number;
  //     totalAmount = getPriceForShift(service.price, TimeShift.FULLDAY);
  //     const schedulesToCreate: any[] = [];
  //     const visitDates = await generateVisitDatesforBirthDoula(
  //       startDate,
  //       endDate,
  //       buffer,
  //     );

  //     for (const visitDate of visitDates) {
  //       schedulesToCreate.push({
  //         date: visitDate,
  //         timeshift: serviceTimeShift,
  //         doulaProfileId,
  //         serviceId: service.id,
  //         clientId: clientProfile.id,
  //       });
  //     }
  //     if (!schedulesToCreate.length) {
  //       throw new BadRequestException(
  //         'No valid schedules available for the selected dates and time slot',
  //       );
  //     }


  //     const result = await this.prisma.$transaction(async (tx) => {

  //       const booking = await tx.serviceBooking.create({
  //         data: {
  //           startDate,
  //           endDate,
  //           regionId: region.id,
  //           servicePricingId: service.id,
  //           doulaProfileId,
  //           clientId: clientProfile.id,
  //           status: BookingStatus.ACTIVE,
  //           isPaid: false
  //         },
  //       });
  //       const payment = await tx.payment.create({
  //         data: {
  //           bookingId: booking.id,
  //           clientId: clientProfile.id,
  //           amount: totalAmount,
  //           currency: 'INR',
  //           status: PaymentStatus.PENDING,
  //           provider: PaymentProvider.STRIPE,
  //         },
  //       });

  //       const checkoutSession =
  //         await this.stripeService.createCheckoutLinkForBooking(
  //           booking,
  //           payment,
  //           userTable.email,
  //           successUrl || this.getDefaultUrl('/booking/success'),
  //           cancelUrl || this.getDefaultUrl('/booking/cancel'),
  //         );

  //       await tx.schedules.createMany({
  //         data: schedulesToCreate.map((schedule) => ({
  //           ...schedule,
  //           bookingId: booking.id,
  //         })),
  //       });

  //       return { booking };
  //     });
  //   }
  //   else if (service.service.name == "Post Partum Doula") {
  //     const schedulesToCreate: any[] = [];
  //     const visitDates = await generateVisitDatesforPostPartumDoula(
  //       startDate,
  //       endDate,
  //       visitFrequency
  //     );
  //     const perDayPrice = getPriceForShift(
  //       service.price,
  //       serviceTimeShift,
  //     );

  //     const numberOfVisits = visitDates.length;
  //     let totalAmount: number;
  //     totalAmount = perDayPrice * numberOfVisits;

  //     for (const visitDate of visitDates) {
  //       schedulesToCreate.push({
  //         date: visitDate,
  //         timeshift: serviceTimeShift,
  //         doulaProfileId,
  //         serviceId: service.id,
  //         clientId: clientProfile.id,
  //       });
  //     }
  //     if (!schedulesToCreate.length) {
  //       throw new BadRequestException(
  //         'No valid schedules available for the selected dates and time slot',
  //       );
  //     }

  //     const result = await this.prisma.$transaction(async (tx) => {

  //       const booking = await tx.serviceBooking.create({
  //         data: {
  //           startDate,
  //           endDate,
  //           regionId: region.id,
  //           servicePricingId: service.id,
  //           doulaProfileId,
  //           clientId: clientProfile.id,
  //         },
  //       });
  //       const payment = await tx.payment.create({
  //         data: {
  //           bookingId: booking.id,
  //           clientId: clientProfile.id,
  //           amount: totalAmount,
  //           currency: 'INR',
  //           status: PaymentStatus.PENDING,
  //           provider: PaymentProvider.STRIPE,
  //         },
  //       });

  //       const checkoutSession =
  //         await this.stripeService.createCheckoutLinkForBooking(
  //           booking,
  //           payment,
  //           userTable.email,
  //           successUrl || this.getDefaultUrl('/booking/success'),
  //           cancelUrl || this.getDefaultUrl('/booking/cancel'),
  //         );

  //       await tx.schedules.createMany({
  //         data: schedulesToCreate.map((schedule) => ({
  //           ...schedule,
  //           bookingId: booking.id,
  //         })),
  //       });

  //       return { booking };
  //     });
  //   }

  // }

  async BookDoula(dto: BookDoulaDto, userId: string) {
    const {
      name,
      email,
      phone,
      address,
      doulaProfileId,
      serviceId,
      serviceStartDate,
      servicEndDate,
      visitFrequency,
      serviceTimeShift,
      buffer,
      successUrl,
      cancelUrl,
    } = dto;

    /* ----------------------------------------------------
     * 1. Fetch user & client profile
     * -------------------------------------------------- */
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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


    const doula = await this.prisma.doulaProfile.findUnique({
      where: { id: doulaProfileId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });
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
    const endDate = this.toUtcMidnight(servicEndDate);

    if (startDate > endDate) {
      throw new BadRequestException('Invalid service date range');
    }

    /* ----------------------------------------------------
     * 5. Generate visit dates
     * -------------------------------------------------- */
    const visitDates =
      servicePricing.service.name === 'Post Partum Doula'
        ? await generateVisitDatesforPostPartumDoula(
          startDate,
          endDate,
          visitFrequency,
        )
        : await generateVisitDatesforBirthDoula(startDate, endDate, buffer);

    /* ----------------------------------------------------
     * 6. Availability validation
     * -------------------------------------------------- */
    for (const visitDate of visitDates) {
      if (
        await isDoulaOffOnShift(
          doulaProfileId,
          visitDate,
          serviceTimeShift,
        )
      ) {
        throw new BadRequestException(
          `Doula is off on ${visitDate.toISOString().split('T')[0]}`,
        );
      }

      if (
        !(await isDoulaAvailableForShift(
          doulaProfileId,
          visitDate,
          serviceTimeShift,
        ))
      ) {
        throw new BadRequestException(
          `Doula not available on ${visitDate.toISOString().split('T')[0]}`,
        );
      }

      const existingSchedule = await this.prisma.schedules.findFirst({
        where: {
          doulaProfileId,
          date: visitDate,
          timeshift: serviceTimeShift,
        },
      });

      if (existingSchedule) {
        throw new BadRequestException(
          `Doula already booked on ${visitDate.toISOString().split('T')[0]}`,
        );
      }
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

    if (servicePricing.service.name === 'Birth Doula') {
      const perDayPrice = getPriceForShift(
        servicePricing.price,
        TimeShift.FULLDAY,
      );
      console.log(perDayPrice)
      console.log(visitDates.length)
      totalAmount = perDayPrice * (visitDates.length - (2 * buffer))
    } else if (servicePricing.service.name === 'Post Partum Doula') {
      const perDayPrice = getPriceForShift(
        servicePricing.price,
        serviceTimeShift,
      );
      console.log(perDayPrice)
      console.log(visitDates.length)
      totalAmount = (perDayPrice * visitDates.length)
    }

    if (totalAmount <= 0) {
      throw new BadRequestException('Invalid total amount');
    }

    const half = totalAmount / 2;
    totalAmount = Math.min(half, 1000);
    totalAmount = Math.round(totalAmount * 100) / 100;

    /* ----------------------------------------------------
     * 10. Create booking + payment (transaction)
     * -------------------------------------------------- */
    const { booking, payment } = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.serviceBooking.create({
        data: {
          startDate,
          endDate,
          regionId: region.id,
          servicePricingId: servicePricing.id,
          doulaProfileId,
          clientId: clientProfile.id,
          status: BookingStatus.PENDING,
          isPaid: false,
          totalAmount: String(totalAmount),
        },
      });
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          clientId: clientProfile.id,
          amount: totalAmount,
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
            serviceEndDate: endDate.toISOString(),
            timeShift: serviceTimeShift,
            visitDates: visitDates.map(d => d.toISOString()),

            // Region details
            regionId: region.id,
            regionName: region.regionName,

            // Doula details
            doulaName: doula?.user.name,
            doulaEmail: doula?.user?.email,
            doulaPhone: doula?.user.phone,

            // Payment details
            totalAmount: totalAmount,
            currency: 'USD',
          }

        },
      });


      return { booking, payment };
    });

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
      currency: 'USD',
      checkout_url: checkoutSession.url,
      successUrl: successUrl,
      cancelUrl: cancelUrl
    };
  }



  private getServiceAttachments(serviceName: string): Attachment[] {
    const normalized = serviceName.trim().toLowerCase();

    if (normalized === 'birth doula') {
      return [
        {
          filename: 'Birth-Doula-Service-Guide.pdf',
          path: '/files/birth-doula-guide.pdf',
          contentType: 'application/pdf',
        },
      ];
    }

    if (normalized === 'postpartum doulas') {
      return [
        {
          filename: 'Postpartum-Doula-Service-Guide.pdf',
          path: '/files/postpartum-doula-guide.pdf',
          contentType: 'application/pdf',
        },
      ];
    }

    return [];
  }

}
