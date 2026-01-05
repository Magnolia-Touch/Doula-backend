// Number of customer, schedules today, total booking service, total revenue

// All with filter date rang

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from 'src/common/utility/pagination.util';
import { FilterUserDto } from './dto/filter-user.dto';
import { Role } from '@prisma/client';
import { format } from 'date-fns';
import { startOfDay, endOfDay } from 'date-fns';
import { UserCountDto } from './dto/user-count.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) { }

  async listUsers(query: FilterUserDto, userId: string, userRole: Role) {
    const { role, is_active, search } = query;
    const searchCondition =
      search && search.trim()
        ? {
          OR: [
            {
              name: {
                contains: search,

              },
            },
            {
              email: {
                contains: search,

              },
            },
            {
              phone: {
                contains: search,
              },
            },
          ],
        }
        : null;
    // Pagination
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const where: any = {};

    if (role) where.role = role;
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    if (searchCondition) {
      where.AND = [...(where.AND || []), searchCondition];
    }

    if (userRole == Role.ZONE_MANAGER) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }, include: { zonemanagerprofile: true }
      })
      if (!user?.zonemanagerprofile) {
        throw new NotFoundException("Zone Manager Profile Not Found");
      }

      const finalWhere = {
        ...where,
        OR: [
          // 1. Doulas under this Zone Manager
          {
            doulaProfile: {
              zoneManager: {
                some: {
                  id: user.zonemanagerprofile.id,
                },
              },
            },
          },

          // 2. Clients under those Doulas
          {
            clientProfile: {
              bookings: {
                some: {
                  DoulaProfile: {
                    zoneManager: {
                      some: {
                        id: user.zonemanagerprofile.id,
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      };


      return paginate({
        prismaModel: this.prisma.user,
        page,
        limit,
        where: finalWhere,
        include: {
          clientProfile: true,
          doulaProfile: true
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return paginate({
      prismaModel: this.prisma.user,
      page,
      limit,
      where,
      include: {
        clientProfile: true,
        doulaProfile: true,
        zonemanagerprofile: true,
        adminProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async countUsersByRole(
    query: UserCountDto,
    userId: string,
    userRole: Role
  ) {
    const { role, is_active, regionId } = query;

    const baseFilter: any = {};
    if (is_active !== undefined) baseFilter.is_active = is_active;

    // helper to return uniform structure
    const response = (
      admins = 0,
      zonemanagers = 0,
      doulas = 0,
      clients = 0
    ) => ({
      total: admins + zonemanagers + doulas + clients,
      counts: {
        admins,
        zonemanagers,
        doulas,
        clients,
      },
    });

    /* -------------------- ZONE MANAGER -------------------- */
    if (userRole === Role.ZONE_MANAGER) {
      const zmUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { zonemanagerprofile: true },
      });

      if (!zmUser?.zonemanagerprofile) {
        throw new NotFoundException("Zone Manager Profile Not Found");
      }

      const zoneManagerId = zmUser.zonemanagerprofile.id;

      const clients = await this.prisma.user.count({
        where: {
          role: Role.CLIENT,
          ...baseFilter,
          clientProfile: {
            Meetings: {
              some: { zoneManagerProfileId: zoneManagerId },
            },
          },
        },
      });

      const doulas = await this.prisma.user.count({
        where: {
          role: Role.DOULA,
          ...baseFilter,
          doulaProfile: {
            zoneManager: {
              some: { id: zoneManagerId },
            },
          },
        },
      });

      return response(0, 1, doulas, clients);
    }

    /* -------------------- ADMIN -------------------- */

    // ADMIN + REGION FILTER
    if (regionId) {
      const [zonemanagers, doulas, clients] = await Promise.all([
        this.prisma.user.count({
          where: {
            role: Role.ZONE_MANAGER,
            ...baseFilter,
            zonemanagerprofile: {
              managingRegion: {
                some: { id: regionId },
              },
            },
          },
        }),
        this.prisma.user.count({
          where: {
            role: Role.DOULA,
            ...baseFilter,
            doulaProfile: {
              Region: {
                some: { id: regionId },
              },
            },
          },
        }),
        this.prisma.user.count({
          where: {
            role: Role.CLIENT,
            ...baseFilter,
            clientProfile: {
              region: regionId,
            },
          },
        }),
      ]);

      return response(0, zonemanagers, doulas, clients);
    }

    // ADMIN + ROLE FILTER
    if (role) {
      const count = await this.prisma.user.count({
        where: { role, ...baseFilter },
      });

      return response(
        role === Role.ADMIN ? count : 0,
        role === Role.ZONE_MANAGER ? count : 0,
        role === Role.DOULA ? count : 0,
        role === Role.CLIENT ? count : 0
      );
    }

    // ADMIN + OVERALL (DEFAULT)
    const [admins, zonemanagers, doulas, clients] =
      await Promise.all([
        this.prisma.user.count({ where: { role: Role.ADMIN, ...baseFilter } }),
        this.prisma.user.count({
          where: { role: Role.ZONE_MANAGER, ...baseFilter },
        }),
        this.prisma.user.count({ where: { role: Role.DOULA, ...baseFilter } }),
        this.prisma.user.count({ where: { role: Role.CLIENT, ...baseFilter } }),
      ]);

    return response(admins, zonemanagers, doulas, clients);
  }


  async ActivecountUsersByRole() {
    const clients = await this.prisma.user.count({
      where: { role: Role.CLIENT, is_active: true },
    });
    const doulas = await this.prisma.user.count({
      where: { role: Role.DOULA, is_active: true },
    });
    const zonemanagers = await this.prisma.user.count({
      where: { role: Role.ZONE_MANAGER, is_active: true },
    });
    const admins = await this.prisma.user.count({
      where: { role: Role.ADMIN, is_active: true },
    });
    const total = await this.prisma.user.count();

    return {
      total,
      clients,
      doulas,
      zonemanagers,
      admins,
    };
  }

  async inactivecountUsersByRole() {
    const clients = await this.prisma.user.count({
      where: { role: Role.CLIENT, is_active: false },
    });
    const doulas = await this.prisma.user.count({
      where: { role: Role.DOULA, is_active: false },
    });
    const zonemanagers = await this.prisma.user.count({
      where: { role: Role.ZONE_MANAGER, is_active: false },
    });
    const admins = await this.prisma.user.count({
      where: { role: Role.ADMIN, is_active: false },
    });
    const total = await this.prisma.user.count();

    return {
      total,
      clients,
      doulas,
      zonemanagers,
      admins,
    };
  }

  async getBookingStats(
    userId: string,
    userRole: Role,
    regionId?: string
  ) {
    let bookingWhere: any = {};

    /* -------------------- ZONE MANAGER -------------------- */
    if (userRole === Role.ZONE_MANAGER) {
      console.log("i am here")
      const zmUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { zonemanagerprofile: true },
      });

      if (!zmUser?.zonemanagerprofile) {
        throw new NotFoundException("Zone Manager Profile Not Found");
      }

      bookingWhere = {
        DoulaProfile: {
          zoneManager: {
            some: { id: zmUser.zonemanagerprofile.id },
          },
        },
      };
    }

    /* -------------------- ADMIN + REGION -------------------- */
    if (userRole === Role.ADMIN && regionId) {
      bookingWhere = {
        regionId,
      };
    }

    const grouped = await this.prisma.serviceBooking.groupBy({
      by: ['status'],
      where: bookingWhere,
      _count: { status: true },
    });

    const counts = {
      ACTIVE: 0,
      COMPLETED: 0,
      CANCELED: 0,
    };

    grouped.forEach((item) => {
      counts[item.status] = item._count.status;
    });

    return {
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      counts,
    };
  }

  async getMeetingStats(
    userId: string,
    userRole: Role,
    regionId?: string
  ) {
    let meetingWhere: any = {};

    /* -------------------- ZONE MANAGER -------------------- */
    if (userRole === Role.ZONE_MANAGER) {
      console.log("i am here")
      const zmUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { zonemanagerprofile: true },
      });

      if (!zmUser?.zonemanagerprofile) {
        throw new NotFoundException("Zone Manager Profile Not Found");
      }

      meetingWhere = {
        ZoneManagerProfile: {
          id: zmUser.zonemanagerprofile.id,
        },
      };
    }

    /* -------------------- ADMIN + REGION -------------------- */
    if (userRole === Role.ADMIN && regionId) {
      meetingWhere = {
        ZoneManagerProfile: {
          managingRegion: {
            some: { id: regionId },
          },
        },
      };
    }

    const grouped = await this.prisma.meetings.groupBy({
      by: ['status'],
      where: meetingWhere,
      _count: { status: true },
    });

    const counts = {
      SCHEDULED: 0,
      COMPLETED: 0,
      CANCELED: 0,
    };

    grouped.forEach((item) => {
      counts[item.status] = item._count.status;
    });

    return {
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      counts,
    };
  }


  async getDailyActivity(startDate?: string, endDate?: string) {
    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) start = startOfDay(new Date(startDate));
    if (endDate) end = endOfDay(new Date(endDate));

    const dateFilter =
      start && end
        ? { gte: start, lte: end }
        : start
          ? { gte: start }
          : end
            ? { lte: end }
            : undefined;

    // BOOKINGS BY createdAt
    const bookings = await this.prisma.serviceBooking.findMany({
      where: {
        ...(dateFilter && { createdAt: dateFilter }),
      },
      select: { createdAt: true },
    });

    // MEETINGS BY createdAt
    const meetings = await this.prisma.meetings.findMany({
      where: {
        ...(dateFilter && { createdAt: dateFilter }),
      },
      select: { createdAt: true },
    });

    const map = new Map();

    // collect bookings
    bookings.forEach((b) => {
      const date = format(b.createdAt, 'yyyy-MM-dd');
      if (!map.has(date)) map.set(date, { noOfBookings: 0, noOfMeetings: 0 });
      map.get(date).noOfBookings++;
    });

    // collect meetings
    meetings.forEach((m) => {
      const date = format(m.createdAt, 'yyyy-MM-dd');
      if (!map.has(date)) map.set(date, { noOfBookings: 0, noOfMeetings: 0 });
      map.get(date).noOfMeetings++;
    });

    // final response list
    const result: Array<{
      date: string;
      weekday: string;
      noOfBookings: number;
      noOfMeetings: number;
    }> = [];

    for (const [date, counts] of map.entries()) {
      const weekday = format(new Date(date), 'EEE'); // Mon, Tue, etc.

      result.push({
        date,
        weekday,
        noOfBookings: counts.noOfBookings,
        noOfMeetings: counts.noOfMeetings,
      });
    }

    result.sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  async calenderSummary(userId: string, startDate: string, endDate: string) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId: userId },
      include: {
        doulas: {
          select: { id: true },
        },
      },
    });
    if (!zoneManager) {
      throw new NotFoundException('Zone Manager Not Found');
    }

    const doulaIds = zoneManager.doulas.map((d) => d.id);

    const meetings = await this.prisma.meetings.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        OR: [
          { zoneManagerProfileId: zoneManager.id },
          { doulaProfileId: { in: doulaIds } },
        ],
      },
      select: {
        date: true,
      },
    });

    const schedules = await this.prisma.schedules.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        doulaProfileId: { in: doulaIds },
      },
      select: { date: true },
    });

    const resultMap = new Map<
      string,
      { appointmentCount: number; scheduleCount: number }
    >();
    const normalizeDate = (date: Date) => date.toISOString().split('T')[0];
    // Meetings count
    meetings.forEach((m) => {
      const key = normalizeDate(m.date);
      if (!resultMap.has(key)) {
        resultMap.set(key, { appointmentCount: 0, scheduleCount: 0 });
      }
      resultMap.get(key)!.appointmentCount += 1;
    });
    // Schedules count
    schedules.forEach((s) => {
      const key = normalizeDate(s.date);
      if (!resultMap.has(key)) {
        resultMap.set(key, { appointmentCount: 0, scheduleCount: 0 });
      }
      resultMap.get(key)!.scheduleCount += 1;
    });
    const response = Array.from(resultMap.entries()).map(([date, counts]) => ({
      date,
      appointmentCount: counts.appointmentCount,
      scheduleCount: counts.scheduleCount,
    }));

    return { data: response };
  }
}
