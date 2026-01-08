import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'src/common/utility/pagination.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { BookingStatus, MeetingStatus, Prisma, Role, ServiceStatus } from '@prisma/client';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingFilterDto } from './dto/bookings-filter.dto';
import { GetMeetingsQueryDto } from './dto/get-meetings.query.dto';
import { GetSchedulesQueryDto } from './dto/get-schedules.query.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';

@Injectable()
export class ServiceBookingService {
  constructor(private prisma: PrismaService) { }

  async findAll(
    query: BookingFilterDto & { page?: number; limit?: number },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: any = {};

    /** ---------------- BASIC FILTERS ---------------- */
    if (query.status) {
      where.status = query.status;
    }

    if (query.isPaid !== undefined) {
      where.isPaid = query.isPaid;
    }

    if (query.regionId) {
      where.regionId = query.regionId;
    }

    if (query.doulaId) {
      where.doulaProfileId = query.doulaId;
    }

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.serviceTimeShift) {
      where.timeshift = query.serviceTimeShift;
    }

    /** ---------------- DATE RANGE FILTER ---------------- */
    if (query.startDate || query.endDate) {
      where.startDate = {};
      if (query.startDate) {
        where.startDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.startDate.lte = new Date(query.endDate);
      }
    }

    /** ---------------- SERVICE FILTER (Service.id) ---------------- */
    if (query.serviceId) {
      where.service = {
        serviceId: query.serviceId, // ServicePricing → Service
      };
    }

    const result = await paginate({
      prismaModel: this.prisma.serviceBooking,
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        DoulaProfile: {
          include: {
            user: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        service: {
          include: {
            service: true, // <-- Service table
          },
        },
        region: true,
        AvailableSlotsForService: true,
      },
    });

    const transformed = (result.data ?? []).map((b: any) => {
      const clientUser = b.client?.user;
      const doulaUser = b.DoulaProfile?.user;

      return {
        bookingId: b.id,

        clientUserId: clientUser?.id ?? null,
        clientName: clientUser?.name ?? null,
        clientProfileId: b.client?.id ?? null,

        doulaUserId: doulaUser?.id ?? null,
        doulaName: doulaUser?.name ?? null,
        doulaProfileId: b.DoulaProfile?.id ?? null,

        regionId: b.region?.id ?? null,
        regionName: b.region?.regionName ?? null,

        serviceId: b.service?.service?.id ?? null,
        serviceName: b.service?.service?.name ?? null,

        start_date: b.startDate,
        end_date: b.endDate,

        timeShift: b.timeshift,
        isPaid: b.isPaid,
        status: b.status,
        createdAt: b.createdAt,
      };
    });

    return {
      message: 'Bookings fetched successfully',
      ...result,
      data: transformed,
    };
  }


  async findById(id: string) {
    const booking = await this.prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        DoulaProfile: {
          include: {
            user: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        service: {
          include: {
            service: true,
          },
        },
        region: true,

        AvailableSlotsForService: true,

        schedules: {
          include: {
            client: {
              include: { user: true },
            },
            DoulaProfile: {
              include: { user: true },
            },
            ServicePricing: {
              include: { service: true },
            },
          },
        },

        Payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Service booking not found');
    }

    const clientUser = booking.client?.user;
    const doulaUser = booking.DoulaProfile?.user;

    const serviceName = booking.service?.service?.name ?? null;

    const startDate = booking.startDate;
    const endDate = booking.endDate;

    const transformed = {
      bookingId: booking.id,

      clientUserId: clientUser?.id ?? null,
      clientName: clientUser?.name ?? null,
      clientProfileId: booking.client?.id ?? null,

      doulaUserId: doulaUser?.id ?? null,
      doulaName: doulaUser?.name ?? null,
      doulaProfileId: booking.DoulaProfile?.id ?? null,

      regionId: booking.region?.id ?? null,
      regionName: booking.region?.regionName ?? null,

      serviceId: booking.service?.service?.id ?? null,
      serviceName,

      start_date: booking.startDate,
      end_date: booking.endDate,
      timeShift: booking.timeshift,

      status: booking.status,
      isPaid: booking.isPaid,
      totalAmount: booking.totalAmount,

      slots: booking.AvailableSlotsForService ?? [],

      schedules: booking.schedules?.map((s) => ({
        scheduleId: s.id,
        date: s.date,
        timeshift: s.timeshift,
        status: s.status,
        cancelledAt: s.cancelledAt,

        clientName: s.client?.user?.name ?? null,
        doulaName: s.DoulaProfile?.user?.name ?? null,

        serviceName: s.ServicePricing?.service?.name ?? null,
      })) ?? [],

      payments: booking.Payment ?? [],

      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };


    return {
      message: 'Booking fetched successfully',
      data: transformed,
    };
  }


  async updateScheduleStatus(
    userId: string,
    userRole: Role,
    scheduleId: string,
    dto: UpdateScheduleStatusDto,
  ) {
    const { status } = dto;

    // -----------------------------
    // 1. Resolve schedule with access control
    // -----------------------------
    let schedule;

    if (userRole === Role.ADMIN) {
      schedule = await this.prisma.schedules.findUnique({
        where: { id: scheduleId },
        include: {
          ServicePricing: {
            include: { service: true },
          },
        },
      });
    }

    if (userRole === Role.DOULA) {
      const doulaProfile = await this.prisma.doulaProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!doulaProfile) {
        throw new ForbiddenException('Doula profile not found');
      }

      schedule = await this.prisma.schedules.findFirst({
        where: {
          id: scheduleId,
          doulaProfileId: doulaProfile.id,
        },
        include: {
          ServicePricing: {
            include: { service: true },
          },
        },
      });
    }

    if (userRole === Role.ZONE_MANAGER) {
      const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!zoneManager) {
        throw new ForbiddenException('Zone manager profile not found');
      }

      schedule = await this.prisma.schedules.findFirst({
        where: {
          id: scheduleId,
          DoulaProfile: {
            zoneManager: {
              some: { id: zoneManager.id },
            },
          },
        },
        include: {
          ServicePricing: {
            include: { service: true },
          },
        },
      });
    }

    if (!schedule) {
      throw new NotFoundException('Schedule not found or access denied');
    }

    const serviceName = schedule.ServicePricing.service.name;
    const bookingId = schedule.bookingId;

    // -----------------------------
    // 2. Transactional updates
    // -----------------------------
    await this.prisma.$transaction(async (tx) => {
      // Update current schedule
      await tx.schedules.update({
        where: { id: scheduleId },
        data: {
          status,
          cancelledAt: status === ServiceStatus.CANCELED ? new Date() : null,
        },
      });

      /**
       * ====================================
       * BIRTH DOULA LOGIC
       * ====================================
       */
      if (serviceName === 'Birth Doula') {
        if (status === ServiceStatus.COMPLETED || status === ServiceStatus.CANCELED) {
          await tx.schedules.updateMany({
            where: { bookingId },
            data: {
              status,
              cancelledAt: status === ServiceStatus.CANCELED ? new Date() : null,
            },
          });

          await tx.serviceBooking.update({
            where: { id: bookingId },
            data: {
              status: status === ServiceStatus.COMPLETED ? ServiceStatus.COMPLETED : ServiceStatus.CANCELED,
              cancelledAt: status === ServiceStatus.CANCELED ? new Date() : null,
            },
          });
        }
      }

      /**
       * ====================================
       * POST PARTUM DOULA LOGIC
       * ====================================
       */
      if (serviceName === 'Post Partum Doula') {
        if (status === 'COMPLETED') {
          const remaining = await tx.schedules.count({
            where: {
              bookingId,
              status: { not: ServiceStatus.CANCELED },
            },
          });

          // If this was the last pending schedule
          if (remaining === 0) {
            await tx.serviceBooking.update({
              where: { id: bookingId },
              data: { status: ServiceStatus.COMPLETED },
            });
          }
        }
        // ❌ No parent cancellation for Post Partum Doula
      }
    });

    return {
      message: 'Schedule status updated successfully',
      scheduleId,
      status,
    };
  }



  async updateBookingStatus(
    userId: string,
    userRole: Role,
    bookingId: string,
    dto: UpdateBookingStatusDto,
  ) {
    const { status } = dto;

    let booking;

    /* ---------------------------------------
     * ACCESS CONTROL
     * --------------------------------------- */
    if (userRole === Role.ADMIN) {
      booking = await this.prisma.serviceBooking.findUnique({
        where: { id: bookingId },
      });
    }

    if (userRole === Role.DOULA) {
      const doulaProfile = await this.prisma.doulaProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!doulaProfile) {
        throw new ForbiddenException('Doula profile not found');
      }

      booking = await this.prisma.serviceBooking.findFirst({
        where: {
          id: bookingId,
          doulaProfileId: doulaProfile.id,
        },
      });
    }

    if (userRole === Role.ZONE_MANAGER) {
      const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!zoneManager) {
        throw new ForbiddenException('Zone manager profile not found');
      }

      booking = await this.prisma.serviceBooking.findFirst({
        where: {
          id: bookingId,
          DoulaProfile: {
            zoneManager: {
              some: { id: zoneManager.id },
            },
          },
        },
      });
    }

    if (!booking) {
      throw new NotFoundException('Booking not found or access denied');
    }

    /* ---------------------------------------
     * TRANSACTION: BOOKING + SCHEDULES
     * --------------------------------------- */
    await this.prisma.$transaction(async (tx) => {
      // 1. Update booking
      await tx.serviceBooking.update({
        where: { id: bookingId },
        data: {
          status,
          cancelledAt: status === BookingStatus.CANCELED ? new Date() : null,
        },
      });

      // 2. Update schedules based on booking status
      if (status === BookingStatus.COMPLETED) {
        await tx.schedules.updateMany({
          where: {
            bookingId,
            status: {
              in: [ServiceStatus.PENDING, ServiceStatus.IN_PROGRESS],
            },
          },
          data: {
            status: ServiceStatus.COMPLETED,
          },
        });
      }

      if (status === BookingStatus.CANCELED) {
        await tx.schedules.updateMany({
          where: {
            bookingId,
            status: ServiceStatus.PENDING,
          },
          data: {
            status: ServiceStatus.CANCELED,
            cancelledAt: new Date(),
          },
        });
      }
    });

    return {
      message: 'Booking and associated schedules updated successfully',
      bookingId,
      status,
    };
  }



  async getAllMeetings(query: GetMeetingsQueryDto) {
    const {
      status,
      date1,
      date2,
      serviceId,
      regionId,
      zoneManagerId,
      meetingId,
      page,
      limit,
    } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (meetingId) {
      where.id = meetingId;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (zoneManagerId) {
      where.zoneManagerProfileId = zoneManagerId;
    }

    /**
     * Date filtering
     */
    if (date1 && !date2) {
      const start = new Date(date1);
      const end = new Date(date1);
      end.setHours(23, 59, 59, 999);

      where.date = {
        gte: start,
        lte: end,
      };
    }

    if (date1 && date2) {
      where.date = {
        gte: new Date(date1),
        lte: new Date(date2),
      };
    }

    /**
     * Region → ZoneManager → managingRegion
     */
    if (regionId) {
      where.ZoneManagerProfile = {
        managingRegion: {
          some: {
            id: regionId,
          },
        },
      };
    }

    return paginate({
      prismaModel: this.prisma.meetings,
      page,
      limit,
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        bookedBy: true,
        Service: true,
        ZoneManagerProfile: {
          include: {
            user: true,
            managingRegion: true,
          },
        },
        AdminProfile: true,
        AvailableSlotsForMeeting: true,
        AvailableSlotsTimeForMeeting: true,
        enquiry: true,
      },
    });
  }



  async getMeetingById(meetingId: string) {
    return this.prisma.meetings.findUnique({
      where: {
        id: meetingId,
      },
      include: {
        bookedBy: {
          include: {
            user: true,
          },
        },
        Service: {
          include: {
            ServicePricing: true,
          },
        },
        ZoneManagerProfile: {
          include: {
            user: true,
            managingRegion: true,
            doulas: true,
          },
        },
        DoulaProfile: {
          include: {
            user: true,
            Region: true,
            ServicePricing: true,
          },
        },
        AdminProfile: {
          include: {
            user: true,
          },
        },
        AvailableSlotsForMeeting: true,
        AvailableSlotsTimeForMeeting: true,
        enquiry: true,
      },
    });
  }

  async getAllSchedules(query: GetSchedulesQueryDto) {
    const {
      date1,
      date2,
      timeshift,
      status,
      doulaId,
      regionId,
      serviceId,
      page,
      limit,
    } = query;

    const where: any = {};

    /* ---------------- Date Logic ---------------- */
    if (date1 && !date2) {
      const start = new Date(date1);
      const end = new Date(date1);
      end.setHours(23, 59, 59, 999);

      where.date = { gte: start, lte: end };
    }

    if (date1 && date2) {
      where.date = {
        gte: new Date(date1),
        lte: new Date(date2),
      };
    }

    /* ---------------- Filters ---------------- */
    if (timeshift) where.timeshift = timeshift;
    if (status) where.status = status;
    if (doulaId) where.doulaProfileId = doulaId;

    if (serviceId) {
      where.ServicePricing = {
        serviceId,
      };
    }

    if (regionId) {
      where.serviceBooking = {
        regionId,
      };
    }

    return paginate({
      prismaModel: this.prisma.schedules,
      page,
      limit,
      where,
      include: {
        DoulaProfile: { include: { user: true } },
        ServicePricing: {
          include: {
            service: true,
          },
        },
        serviceBooking: {
          include: {
            region: true,
          },
        },
        client: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  /* ----------------------------------------------------
   * Get schedule by ID
   * -------------------------------------------------- */
  async getScheduleById(scheduleId: string) {
    const schedule = await this.prisma.schedules.findUnique({
      where: { id: scheduleId },
      include: {
        DoulaProfile: { include: { user: true } },
        ServicePricing: {
          include: {
            service: true,
          },
        },
        serviceBooking: {
          include: {
            region: true,
          },
        },
        client: { include: { user: true } },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }



  async getAllTestimonial(dto: GetTestimonialsDto) {
    const {
      doulaId,
      serviceId,
      regionId,
      ratings,
      date1,
      date2,
      page,
      limit,
    } = dto;

    const where: Prisma.TestimonialsWhereInput = {};

    /* -----------------------------------------
     * Direct Filters
     * --------------------------------------- */
    if (doulaId) {
      where.doulaProfileId = doulaId;
    }

    if (ratings) {
      where.ratings = ratings;
    }

    /* -----------------------------------------
     * Service Filter (IMPORTANT)
     * Testimonials.serviceId → ServicePricing.id
     * ServicePricing.serviceId → Service.id
     * --------------------------------------- */
    if (serviceId) {
      where.ServicePricing = {
        serviceId,
      };
    }

    /* -----------------------------------------
     * Region Filter (via DoulaProfile)
     * --------------------------------------- */
    if (regionId) {
      where.DoulaProfile = {
        Region: {
          some: {
            id: regionId,
          },
        },
      };
    }

    /* -----------------------------------------
     * Date Filters
     * --------------------------------------- */
    if (date1 && !date2) {
      const start = new Date(date1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date1);
      end.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: start,
        lte: end,
      };
    }

    if (date1 && date2) {
      where.createdAt = {
        gte: new Date(date1),
        lte: new Date(date2),
      };
    }

    /* -----------------------------------------
     * Pagination
     * --------------------------------------- */
    return paginate({
      prismaModel: this.prisma.testimonials,
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        DoulaProfile: {
          include: {
            user: true,
            Region: true,
          },
        },
        ServicePricing: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async getById(id: string) {
    const testimonial = await this.prisma.testimonials.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        DoulaProfile: {
          include: {
            user: true,
            Region: true,
          },
        },
        ServicePricing: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }

    return testimonial;
  }

}