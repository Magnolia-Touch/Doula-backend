import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'src/common/utility/pagination.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { Role, ServiceStatus } from '@prisma/client';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingFilterDto } from './dto/bookings-filter.dto';

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


    let schedule;
    if (userRole === Role.ADMIN) {
      schedule = await this.prisma.schedules.findUnique({
        where: { id: scheduleId },
      });
    }
    /* ---------------------------------------
     * DOULA access
     * --------------------------------------- */
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
              some: {
                id: zoneManager.id,
              },
            },
          },
        },
      });
    }

    if (!schedule) {
      throw new NotFoundException('Schedule not found or access denied');
    }

    const updatedSchedule = await this.prisma.schedules.update({
      where: { id: scheduleId },
      data: { status },
    });

    return {
      message: 'Schedule status updated successfully',
      scheduleId: updatedSchedule.id,
      status: updatedSchedule.status,
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
     * DOULA access
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

    /* ---------------------------------------
     * ZONE MANAGER access
     * --------------------------------------- */
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
              some: {
                id: zoneManager.id,
              },
            },
          },
        },
      });
    }

    if (!booking) {
      throw new NotFoundException('Booking not found or access denied');
    }

    const updatedBooking = await this.prisma.serviceBooking.update({
      where: { id: bookingId },
      data: { status },
    });

    return {
      message: 'Booking status updated successfully',
      bookingId: updatedBooking.id,
      status: updatedBooking.status,
    };
  }

}
