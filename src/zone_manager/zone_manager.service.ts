import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
// import { UpdateZoneManagerDto } from './dto/update-zone-manager.dto';
import {
  BookingStatus,
  MeetingStatus,
  Prisma,
  Role,
  ServiceStatus,
} from '@prisma/client';
import { paginate } from 'src/common/utility/pagination.util';
import {
  findRegionOrThrow,
  findZoneManagerOrThrowWithId,
  formatTimeOnly,
} from 'src/common/utility/service-utils';
import { UpdateZoneManagerRegionDto } from './dto/update-zone-manager.dto';
import { UpdateDoulaProfileDto } from 'src/doula/dto/update-doula.dto';
import { GetDoulasQueryDto } from './dto/doula-under-zm-query.dto';
import { PriceBreakdownDto } from 'src/service-pricing/dto/service-pricing.dto';
import { ListZoneUsersQueryDto } from './dto/list-zone-users-query.dto';
import { UpdateUserCommissionDto } from './dto/update-user-commission.dto';

type ZoneManagerRecentActivity = {
  id: string; // activity id (derived from source record)
  entityType: 'BOOKING' | 'MEETING' | 'DOULA' | 'GALLERY';
  entityId: string; // bookingId / meetingId / doulaId / galleryId
  action:
  | 'BOOKING_CREATED'
  | 'BOOKING_COMPLETED'
  | 'BOOKING_CANCELED'
  | 'MEETING_SCHEDULED'
  | 'MEETING_COMPLETED'
  | 'MEETING_CANCELED'
  | 'DOULA_PROFILE_UPDATED'
  | 'GALLERY_IMAGE_ADDED';
  title: string;
  description: string;
  date: Date;
};

@Injectable()
export class ZoneManagerService {
  constructor(private prisma: PrismaService) { }

  // Create new Zone Manager
  async create(dto: CreateZoneManagerDto, profileImageUrl?: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    console.log('regionIds', dto.regionIds);
    const regions = await this.prisma.region.findMany({
      where: { id: { in: dto.regionIds } },
    });
    if (regions.length != dto.regionIds.length) {
      throw new NotFoundException('One or more region IDs are invalid');
    }
    if (regions.some((r) => r.zoneManagerId !== null)) {
      throw new BadRequestException(
        'One or more regions are already assigned to another Zone Manager',
      );
    }

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new BadRequestException('User with this email already exists');
      }

      if (existingUser.phone === dto.phone) {
        throw new BadRequestException(
          'User with this phone number already exists',
        );
      }
    }

    const zoneManager = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: Role.ZONE_MANAGER,
        zonemanagerprofile: {
          create: {
            managingRegion: {
              connect: dto.regionIds.map((id) => ({ id })),
            },
            profile_image: profileImageUrl ?? null,
          },
        },
      },
      include: { zonemanagerprofile: true },
    });

    return { message: 'Zone Manager created successfully', data: zoneManager };
  }

  async get(
    page = 1,
    limit = 10,
    search?: string,
    regionId?: string,
    is_active?: boolean,
  ) {
    const where: Prisma.UserWhereInput = {
      role: Role.ZONE_MANAGER,

      ...(typeof is_active === 'boolean' && {
        is_active,
      }),

      ...(regionId && {
        zonemanagerprofile: {
          managingRegion: {
            some: {
              id: regionId,
            },
          },
        },
      }),

      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          {
            zonemanagerprofile: {
              managingRegion: {
                some: {
                  regionName: {
                    contains: search,
                  },
                },
              },
            },
          },
        ],
      }),
    };

    const result = await paginate({
      prismaModel: this.prisma.user,
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        zonemanagerprofile: {
          include: {
            managingRegion: {
              select: { regionName: true },
            },
            doulas: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    /**
     * 👇 Explicit Prisma payload typing (KEY FIX)
     */
    type ZoneManagerUserWithRelations = Prisma.UserGetPayload<{
      include: {
        zonemanagerprofile: {
          include: {
            managingRegion: {
              select: { regionName: true };
            };
            doulas: {
              include: {
                user: {
                  select: { name: true };
                };
              };
            };
          };
        };
      };
    }>;

    const data = (result.data as ZoneManagerUserWithRelations[]).map(
      (user) => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,

        profileId: user.zonemanagerprofile?.id ?? null,

        regions:
          user.zonemanagerprofile?.managingRegion.map((r) => r.regionName) ??
          [],

        doulas:
          user.zonemanagerprofile?.doulas
            .map((d) => d.user?.name)
            .filter(Boolean) ?? [],
      }),
    );

    return {
      message: 'Zone Managers fetched successfully',
      data,
      meta: result.meta,
    };
  }

  async getById(id: string) {
    const zoneManager = await this.prisma.user.findUnique({
      where: { id },
      include: {
        zonemanagerprofile: {
          include: {
            managingRegion: true, // ✅ full Region objects
            doulas: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    is_active: true,
                  },
                },
                Region: true, // regions assigned to doula
              },
            },
          },
        },
      },
    });

    if (!zoneManager || zoneManager.role !== Role.ZONE_MANAGER) {
      throw new NotFoundException('Zone Manager not found');
    }

    const profile = zoneManager.zonemanagerprofile;

    const response = {
      userId: zoneManager.id,
      name: zoneManager.name,
      email: zoneManager.email,
      phone: zoneManager.phone,
      role: zoneManager.role,
      is_active: zoneManager.is_active,

      profileId: profile?.id ?? null,

      regions:
        profile?.managingRegion.map((region) => ({
          id: region.id,
          regionName: region.regionName,
          pincode: region.pincode,
          district: region.district,
          state: region.state,
          country: region.country,
          latitude: region.latitude,
          longitude: region.longitude,
          is_active: region.is_active,
        })) ?? [],

      doulas:
        profile?.doulas.map((doula) => ({
          doulaProfileId: doula.id,
          userId: doula.user.id,
          name: doula.user.name,
          email: doula.user.email,
          phone: doula.user.phone,
          is_active: doula.user.is_active,

          description: doula.description,
          qualification: doula.qualification,
          achievements: doula.achievements,
          yoe: doula.yoe,
          languages: doula.languages,

          regions: doula.Region.map((region) => ({
            id: region.id,
            regionName: region.regionName,
            pincode: region.pincode,
            district: region.district,
            state: region.state,
            country: region.country,
          })),
        })) ?? [],
    };

    return {
      message: 'Zone Manager fetched successfully',
      data: response,
    };
  }

  // Delete Zone Manager
  async delete(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== Role.ZONE_MANAGER) {
      throw new NotFoundException('Zone Manager not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { is_active: false },
    });

    return { message: 'Zone Manager deleted successfully', data: null };
  }

  async updateStatus(id: string, isActive: boolean) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== Role.ZONE_MANAGER) {
      throw new NotFoundException('Zone Manager not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        is_active: isActive,
      },
    });

    return {
      message: 'Zone Manager status updated successfully',
      data: updated,
    };
  }

  async UpdateZoneManagerRegions(dto: UpdateZoneManagerRegionDto) {
    const a = findZoneManagerOrThrowWithId(this.prisma, dto.profileId);
    console.log(a);
    const regions = await this.prisma.region.findMany({
      where: { id: { in: dto.regionIds } },
    });
    if (regions.length != dto.regionIds.length) {
      throw new NotFoundException('One or more region IDs are invalid');
    }

    if (dto.purpose == 'add') {
      const data = await this.prisma.region.updateMany({
        where: { id: { in: dto.regionIds } },
        data: { zoneManagerId: dto.profileId },
      });

      return {
        message: `${data.count} Region(s) successfully assigned to Manager`,
      };
    } else if (dto.purpose == 'remove') {
      const data = await this.prisma.region.updateMany({
        where: { id: { in: dto.regionIds } },
        data: { zoneManagerId: null },
      });

      return {
        message: `${data.count} Region(s) successfully removed from Manager`,
      };
    }
  }

  //helper api
  async regionAlreadyAssignedOrNot(regionIds: string[]) {
    const regions = await this.prisma.region.findMany({
      where: { id: { in: regionIds } },
      select: { id: true, regionName: true, zoneManagerId: true },
    });

    if (regions.length !== regionIds.length) {
      throw new NotFoundException('One or more region IDs are invalid');
    }

    const assigned = regions.filter((r) => r.zoneManagerId !== null);
    const unassigned = regions.filter((r) => r.zoneManagerId === null);

    return {
      message: 'Region assignment status fetched',
      assignedCount: assigned.length,
      unassignedCount: unassigned.length,
      assigned,
      unassigned,
    };
  }

  async getZoneManagerSchedules(
    userId: string,
    page = 1,
    limit = 10,
    filters?: {
      serviceName?: string;
      status?: ServiceStatus;
      search?: string;
      date?: string;
    },
  ) {
    console.log('user', userId);
    // Fetch zone manager profile
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    /**
     * Build WHERE clause
     */
    const where: Prisma.SchedulesWhereInput = {
      DoulaProfile: {
        zoneManager: {
          some: {
            id: zoneManager.id,
          },
        },
      },
    };
    const AND: Prisma.SchedulesWhereInput[] = [];
    /* Service Status */
    if (filters?.status) {
      where.status = filters.status;
    }

    /* Date filter (@db.Date) */
    if (filters?.date) {
      where.date = new Date(filters.date);
    }

    if (filters?.serviceName) {
      AND.push({
        ServicePricing: {
          service: {
            name: {
              contains: filters.serviceName,
            },
          },
        },
      });
    }
    /* Service Name */
    if (filters?.search) {
      const search = filters.search.trim();

      AND.push({
        OR: [
          /* Service Name */
          /* Client Name */
          {
            client: {
              user: {
                name: {
                  contains: search,
                },
              },
            },
          },

          /* Client Email */
          {
            client: {
              user: {
                email: {
                  contains: search,
                },
              },
            },
          },

          /* Doula Name */
          {
            DoulaProfile: {
              user: {
                name: {
                  contains: search,
                },
              },
            },
          },

          /* Doula Email */
          {
            DoulaProfile: {
              user: {
                email: {
                  contains: search,
                },
              },
            },
          },
        ],
      });
    }

    if (AND.length > 0) {
      where.AND = AND;
    }

    const result = await paginate({
      prismaModel: this.prisma.schedules,
      page,
      limit,
      where,
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        DoulaProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        ServicePricing: {
          include: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    type ZoneManagerSchedule = Prisma.SchedulesGetPayload<{
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
                email: true;
              };
            };
          };
        };
        DoulaProfile: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
                email: true;
              };
            };
          };
        };
        ServicePricing: {
          include: {
            service: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    }>;

    const schedules = result.data as ZoneManagerSchedule[];

    return {
      success: true,
      message: 'Schedules fetched successfully',
      data: schedules.map((schedule) => {
        // const durationMs =
        //   schedule.endTime.getTime() - schedule.startTime.getTime();

        // const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        // const durationMinutes = (durationMs % (1000 * 60 * 60)) / (1000 * 60);

        return {
          scheduleId: schedule.id,
          serviceName: schedule.ServicePricing.service.name,
          serviceTimeshift: schedule.timeshift,
          scheduleDate: schedule.date,
          status: schedule.status,

          clientId: schedule.client.id,
          clientName: schedule.client.user.name,
          clientEmail: schedule.client.user.email,
          doulaId: schedule.DoulaProfile.id,
          doulaName: schedule.DoulaProfile.user.name,
          doulaEmail: schedule.DoulaProfile.user.email,
        };
      }),
      meta: result.meta,
    };
  }

  async getZoneManagerBookedServices(
    userId: string,
    page = 1,
    limit = 10,
    filters?: {
      serviceName?: string;
      search?: string;
      status?: BookingStatus;
      startDate?: string;
      endDate?: string;
    },
  ) {
    // Fetch zone manager profile
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    /**
     * Base WHERE clause
     * → bookings of doulas managed by this zone manager
     */
    const where: Prisma.ServiceBookingWhereInput = {
      DoulaProfile: {
        zoneManager: {
          some: {
            id: zoneManager.id,
          },
        },
      },
    };
    const AND: Prisma.ServiceBookingWhereInput[] = [];

    /**
     * Filter: Booking status
     */
    if (filters?.status) {
      where.status = filters.status;
    }

    /**
     * Filter: Date range
     * If date falls between startDate and endDate
     */
    if (filters?.startDate || filters?.endDate) {
      where.AND = [];

      if (filters?.startDate) {
        AND.push({
          endDate: {
            gte: new Date(filters.startDate),
          },
        });
      }

      if (filters?.endDate) {
        AND.push({
          startDate: {
            lte: new Date(filters.endDate),
          },
        });
      }
    }
    if (filters?.serviceName) {
      AND.push({
        service: {
          service: {
            name: {
              contains: filters.serviceName,
            },
          },
        },
      });
    }

    if (filters?.search) {
      const search = filters.search.trim();

      AND.push({
        OR: [
          /* Client Name */
          {
            client: {
              user: {
                name: {
                  contains: search,
                },
              },
            },
          },

          /* Client Email */
          {
            client: {
              user: {
                email: {
                  contains: search,
                },
              },
            },
          },

          /* Doula Name */
          {
            DoulaProfile: {
              user: {
                name: {
                  contains: search,
                },
              },
            },
          },

          /* Doula Email */
          {
            DoulaProfile: {
              user: {
                email: {
                  contains: search,
                },
              },
            },
          },
        ],
      });
    }

    if (AND.length > 0) {
      where.AND = AND;
    }

    where.status = { not: BookingStatus.PENDING };
    const result = await paginate({
      prismaModel: this.prisma.serviceBooking,
      page,
      limit,
      where,
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        DoulaProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        service: {
          include: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    type ZoneManagerBooking = Prisma.ServiceBookingGetPayload<{
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
                email: true;
              };
            };
          };
        };
        DoulaProfile: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
                email: true;
              };
            };
          };
        };
        service: {
          include: {
            service: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    }>;

    const bookings = result.data as ZoneManagerBooking[];

    return {
      success: true,
      message: 'Booked services fetched successfully',

      data: bookings.map((booking) => ({
        bookingId: booking.id,

        clientId: booking.client.id,
        clientName: booking.client.user.name,
        clientEmail: booking.client.user.email,

        doulaId: booking.DoulaProfile.id,
        doulaName: booking.DoulaProfile.user.name,
        doulaEmail: booking.DoulaProfile.user.email,

        servicePricingId: booking.service.id,
        serviceName: booking.service.service.name,

        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        timeshift: booking.timeshift,
      })),
      meta: result.meta,
    };
  }

  async getZoneManagerMeetings(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    status?: MeetingStatus,
    serviceName?: string,
    date1?: string,
    date2?: string,
  ) {
    // Fetch zone manager pro
    // file
    console.log('servicename', serviceName);
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    /**
     * Fetch all doula IDs under this zone manager
     */
    const doulas = await this.prisma.doulaProfile.findMany({
      where: {
        zoneManager: {
          some: {
            id: zoneManager.id,
          },
        },
      },
      select: { id: true },
    });

    const doulaIds = doulas.map((d) => d.id);

    /**
     * WHERE condition:
     * 1. Meetings of zone manager
     * 2. Meetings of doulas under zone manager
     */
    const where: Prisma.MeetingsWhereInput = {
      OR: [
        // ✅ Zone manager's own meetings
        {
          zoneManagerProfileId: zoneManager.id,
        },

        // ✅ Meetings created by DOULA under this zone manager
        {
          AND: [
            { doulaProfileId: { in: doulaIds } },
            { createdby: Role.DOULA },
          ],
        },
      ],
    };

    where.AND = [];
    if (search) {
      where.AND.push({
        OR: [
          // Client name search
          {
            bookedBy: {
              user: {
                name: {
                  contains: search.toLowerCase(),
                },
              },
            },
          },

          // Service name via Service relation
          {
            Service: {
              name: {
                contains: search.toLowerCase(),
              },
            },
          },

          // Fallback serviceName stored in Meetings table
          {
            serviceName: {
              contains: search.toLowerCase(),
            },
          },
        ],
      });
    }
    if (serviceName) {
      where.AND.push({
        OR: [
          // Service name via relation
          {
            Service: {
              name: {
                contains: serviceName,
              },
            },
          },
          // Fallback serviceName stored in Meetings table
          {
            serviceName: {
              contains: serviceName,
            },
          },
        ],
      });
    }
    if (status) {
      where.AND.push({
        status: status,
      });
    }

    /* ---------------- Date filter ---------------- */
    if (date1) {
      const start = new Date(date1);
      start.setHours(0, 0, 0, 0);

      const end = date2 ? new Date(date2) : new Date(date1);
      end.setHours(23, 59, 59, 999);

      where.AND.push({
        date: {
          gte: start,
          lte: end,
        },
      });
    }

    const result = await paginate({
      prismaModel: this.prisma.meetings,
      page,
      limit,
      where,
      include: {
        bookedBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        DoulaProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        Service: {
          select: {
            id: true,
            name: true,
          },
        },
        // ✅ Add enquiry data
        enquiry: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    type ZoneManagerMeeting = Prisma.MeetingsGetPayload<{
      include: {
        bookedBy: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
        DoulaProfile: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
        Service: {
          select: {
            id: true;
            name: true;
          };
        };
        enquiry: true;
      };
    }>;

    const meetings = result.data as ZoneManagerMeeting[];

    return {
      success: true,
      message: 'Zone manager meetings fetched successfully',
      data: meetings.map((meeting) => ({
        meetingId: meeting.id,
        clientId: meeting.bookedBy.id,
        clientName: meeting.bookedBy.user.name,

        doulaId: meeting.DoulaProfile?.id ?? null,
        doulaName: meeting.DoulaProfile?.user.name ?? null,

        servicePricingId: meeting.serviceId ?? null,
        serviceName: meeting.Service?.name ?? meeting.serviceName,

        startDate: formatTimeOnly(meeting.startTime),
        endDate: formatTimeOnly(meeting.endTime),
        status: meeting.status,
        meetingDate: meeting.date,
        createdby: meeting.createdby,

        // ✅ Add enquiry data
        enquiry: meeting.enquiry ?? null,
      })),
      meta: result.meta,
    };
  }

  async getZoneManagerScheduleById(userId: string, scheduleId: string) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    const schedule = await this.prisma.schedules.findFirst({
      where: {
        id: scheduleId,
        DoulaProfile: {
          zoneManager: {
            some: { id: zoneManager.id },
          },
        },
      },
      include: {
        client: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        DoulaProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        ServicePricing: {
          include: {
            service: { select: { name: true } },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // const durationMs =
    //   schedule.endTime.getTime() - schedule.startTime.getTime();

    // const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    // const durationMinutes = (durationMs % (1000 * 60 * 60)) / (1000 * 60);

    return {
      success: true,
      message: 'Schedule fetched successfully',
      data: {
        scheduleId: schedule.id,
        serviceName: schedule.ServicePricing.service.name,
        serviceTimeshift: schedule.timeshift,
        scheduleDate: schedule.date,
        status: schedule.status,

        clientId: schedule.client.id,
        clientName: schedule.client.user.name,
        clientEmail: schedule.client.user.email,
        doulaId: schedule.DoulaProfile.id,
        doulaName: schedule.DoulaProfile.user.name,
        doulaEmail: schedule.DoulaProfile.user.email,
      },
    };
  }

  async getZoneManagerBookedServiceById(userId: string, bookingId: string) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    const booking = await this.prisma.serviceBooking.findFirst({
      where: {
        id: bookingId,
        DoulaProfile: {
          zoneManager: {
            some: { id: zoneManager.id },
          },
        },
      },
      include: {
        client: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        DoulaProfile: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        service: {
          include: {
            service: { select: { name: true } },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booked service not found');
    }

    return {
      success: true,
      message: 'Booked service fetched successfully',
      data: {
        serviceBookingId: booking.id,
        clientId: booking.client.id,
        clientName: booking.client.user.name,

        doulaId: booking.DoulaProfile.id,
        doulaName: booking.DoulaProfile.user.name,

        servicePricingId: booking.service.id,
        serviceName: booking.service.service.name,

        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        timeshift: booking.timeshift,
      },
    };
  }

  async getZoneManagerMeetingById(userId: string, meetingId: string) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    const doulas = await this.prisma.doulaProfile.findMany({
      where: {
        zoneManager: {
          some: { id: zoneManager.id },
        },
      },
      select: { id: true },
    });

    const doulaIds = doulas.map((d) => d.id);

    const meeting = await this.prisma.meetings.findFirst({
      where: {
        id: meetingId,
        OR: [
          { zoneManagerProfileId: zoneManager.id },
          { doulaProfileId: { in: doulaIds } },
        ],
      },
      include: {
        bookedBy: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        DoulaProfile: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        Service: {
          select: {
            id: true,
            name: true,
          },
        },
        // ✅ Add enquiry data
        enquiry: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return {
      success: true,
      message: 'Meeting fetched successfully',
      data: {
        meetingId: meeting.id,
        clientId: meeting.bookedBy.id,
        clientName: meeting.bookedBy.user.name,

        doulaId: meeting.DoulaProfile?.id ?? null,
        doulaName: meeting.DoulaProfile?.user.name ?? null,

        servicePricingId: meeting.serviceId ?? null,
        serviceName: meeting.Service?.name ?? meeting.serviceName,

        startDate: formatTimeOnly(meeting.startTime),
        endDate: formatTimeOnly(meeting.endTime),
        status: meeting.status,
        createdby: meeting.createdby,

        // ✅ Add enquiry data
        enquiry: meeting.enquiry ?? null,
      },
    };
  }

  async getDoulasUnderZm(userId: string, query: GetDoulasQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      serviceName,
      isAvailable,
      startDate,
      endDate,
      minExperience,
      isActive,
      regionId,
      serviceId,
    } = query;

    console.log('query', query);
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    const skip = (page - 1) * limit;

    /* -------------------------------
       Base where condition
    --------------------------------*/
    const where: any = {
      zoneManager: {
        some: { id: zoneManager.id },
      },
    };

    /* -------------------------------
       User search & active filter
    --------------------------------*/
    if (search || typeof isActive === 'boolean') {
      where.user = {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }),
        ...(typeof isActive === 'boolean' && { is_active: isActive }),
      };
    }

    /* -------------------------------
       Experience filter
    --------------------------------*/
    if (minExperience) {
      where.yoe = { gte: Number(minExperience) };
    }

    /* -------------------------------
       Region filter
    --------------------------------*/
    if (regionId) {
      where.Region = {
        some: { id: regionId },
      };
    }

    /* -------------------------------
       Service filter (by id or name)
    --------------------------------*/
    if (serviceId || serviceName) {
      where.ServicePricing = {
        some: {
          ...(serviceId && { serviceId }),
          ...(serviceName && {
            service: {
              name: { contains: serviceName },
            },
          }),
        },
      };
    }

    /* -------------------------------
       Availability filter
    --------------------------------*/
    if (isAvailable && startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : start;

      where.AND = [
        // 1️⃣ No schedules in date range
        {
          NOT: {
            Schedules: {
              some: {
                date: {
                  gte: start,
                  lte: end,
                },
              },
            },
          },
        },

        // 2️⃣ Has availability with at least one shift = true
        {
          AvailableSlotsForService: {
            some: {
              date: {
                gte: start,
                lte: end,
              },
              OR: [
                { availability: { path: ['MORNING'], equals: true } },
                { availability: { path: ['NIGHT'], equals: true } },
                { availability: { path: ['FULLDAY'], equals: true } },
              ],
            },
          },
        },
      ];
    }

    /* -------------------------------
       Fetch doulas
    --------------------------------*/
    const [doulas, total] = await Promise.all([
      this.prisma.doulaProfile.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          yoe: true,
          qualification: true,
          languages: true,
          specialities: true,
          profile_image: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              is_active: true,
            },
          },

          Region: {
            select: {
              id: true,
              regionName: true,
              is_active: true,
              createdAt: true,
              updatedAt: true,
              pincode: true,
              district: true,
              state: true,
              country: true,
              latitude: true,
              longitude: true,
            },
          },

          ServicePricing: {
            select: {
              id: true,
              price: true,
              service: {
                select: { name: true },
              },
            },
          },
        },
      }),
      this.prisma.doulaProfile.count({ where }),
    ]);
    const doulaProfileIds = doulas.map((d) => d.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await this.prisma.schedules.findMany({
      where: {
        doulaProfileId: { in: doulaProfileIds },
        status: { not: MeetingStatus.CANCELED },
      },
      select: {
        doulaProfileId: true,
        date: true,
      },
    });
    const availableSlots = await this.prisma.availableSlotsForService.findMany({
      where: {
        doulaId: { in: doulaProfileIds },
        date: { gte: today },
      },
      select: {
        doulaId: true,
        date: true,
        availability: true,
      },
      orderBy: { date: 'asc' },
    });
    const scheduleMap = new Map<string, Date[]>();

    for (const s of schedules) {
      if (!scheduleMap.has(s.doulaProfileId)) {
        scheduleMap.set(s.doulaProfileId, []);
      }
      scheduleMap.get(s.doulaProfileId)!.push(s.date);
    }

    const availabilityMap = new Map<
      string,
      { date: Date; availability: Record<string, boolean> }[]
    >();

    for (const slot of availableSlots) {
      if (!availabilityMap.has(slot.doulaId)) {
        availabilityMap.set(slot.doulaId, []);
      }
      availabilityMap.get(slot.doulaId)!.push({
        date: slot.date,
        availability: slot.availability as Record<string, boolean>,
      });
    }
    const normalizeDate = (d: Date) => {
      const n = new Date(d);
      n.setHours(0, 0, 0, 0);
      return n.getTime();
    };

    function isDateAvailable(
      date: Date,
      availability: Record<string, boolean>,
      bookedDates: Date[],
    ) {
      if (Object.values(availability).some((v) => v === false)) {
        return false;
      }

      return !bookedDates.some((d) => normalizeDate(d) === normalizeDate(date));
    }

    /* -------------------------------
       Response shaping
    --------------------------------*/
    const formattedDoulas = doulas.map((doula) => {
      const bookedDates = scheduleMap.get(doula.id) ?? [];
      const slotEntries = availabilityMap.get(doula.id) ?? [];

      let nextAvailableDate: Date | null = null;

      for (const slot of slotEntries) {
        if (isDateAvailable(slot.date, slot.availability, bookedDates)) {
          nextAvailableDate = slot.date;
          break;
        }
      }

      return {
        userId: doula.user.id,
        profileId: doula.id,
        name: doula.user.name,
        email: doula.user.email,
        phone: doula.user.phone,
        is_active: doula.user.is_active,

        yoe: doula.yoe,
        qualification: doula.qualification,
        languages: doula.languages,
        specialities: doula.specialities,
        profileImage: doula.profile_image,

        regions: doula.Region.map((region) => ({
          id: region.id,
          regionName: region.regionName,
          pincode: region.pincode,
          district: region.district,
          state: region.state,
          country: region.country,
          latitude: region.latitude,
          longitude: region.longitude,
          is_active: region.is_active,
          createdAt: region.createdAt,
          updatedAt: region.updatedAt,
        })),

        services: doula.ServicePricing.map((sp) => ({
          id: sp.id,
          name: sp.service.name,
          price: sp.price,
        })),

        nextImmediateAvailabilityDate: nextAvailableDate,
      };
    });

    return {
      status: 'success',
      data: formattedDoulas,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async addDoulaGalleryImages(
    doulaId: string,
    images: {
      url: string;
    }[] = [],
    userId: string,
  ) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }
    if (!images || images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: doulaId, zoneManager: { some: { id: zoneManager.id } } },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const galleryData = images.map((image) => ({
      doulaProfileId: doulaProfile.id,
      url: image.url,
      altText: 'Doula Gallery Image',
    }));

    await this.prisma.doulaGallery.createMany({
      data: galleryData,
    });

    const galleryImages = await this.prisma.doulaGallery.findMany({
      where: {
        doulaProfileId: doulaProfile.id,
        url: {
          in: galleryData.map((g) => g.url),
        },
      },
      select: {
        id: true,
        url: true,
        altText: true,
        createdAt: true,
      },
    });

    return {
      message: 'Gallery images uploaded successfully',
      data: galleryImages,
    };
  }

  async getDoulaGalleryImages(doulaId: string, userId: string) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: doulaId, zoneManager: { some: { id: zoneManager.id } } },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const images = await this.prisma.doulaGallery.findMany({
      where: {
        doulaProfileId: doulaProfile.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      status: 'success',
      message: 'Doula gallery images fetched successfully',
      data: images,
    };
  }

  async deleteDoulaGalleryImage(
    doulaId: string,
    imageId: string,
    userId: string,
  ) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: doulaId, zoneManager: { some: { id: zoneManager.id } } },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const image = await this.prisma.doulaGallery.findUnique({
      where: { id: imageId },
    });

    if (!image || image.doulaProfileId !== doulaProfile.id) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.doulaGallery.delete({
      where: { id: imageId },
    });

    return {
      message: 'Gallery image deleted successfully',
    };
  }

  async updateDoulaProfile(
    doulaId: string,
    dto: UpdateDoulaProfileDto,
    userId: string,
  ) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: doulaId, zoneManager: { some: { id: zoneManager.id } } },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const {
      name,
      is_active,
      about,
      achievements,
      qualification,
      experience,
      languages,
      specialities,
      certificates,
      servicePricings,
    } = dto;

    const operations: any[] = [];

    // 1. Update User
    operations.push(
      this.prisma.user.update({
        where: { id: doulaId },
        data: {
          ...(name !== undefined && { name }),
          ...(is_active !== undefined && { is_active }),
        },
      }),
    );

    // 2. Update Doula Profile
    operations.push(
      this.prisma.doulaProfile.update({
        where: { userId: doulaId },
        data: {
          ...(about !== undefined && { description: about }),
          ...(achievements !== undefined && { achievements }),
          ...(qualification !== undefined && { qualification }),
          ...(experience !== undefined && { yoe: experience }),
          ...(languages !== undefined && { languages }),
          ...(specialities !== undefined && { specialities }),
        },
      }),
    );

    /**
     * 2. Update Service Pricing (OPTIONAL)
     */
    const toJsonPrice = (price: PriceBreakdownDto): Prisma.InputJsonObject => ({
      morning: price.morning,
      night: price.night,
      fullday: price.fullday,
    });

    if (servicePricings?.length) {
      for (const pricing of servicePricings) {
        operations.push(
          this.prisma.servicePricing.updateMany({
            where: {
              id: pricing.servicePricingId,
              doulaProfileId: doulaProfile.id, // ownership safety
            },
            data: {
              price: toJsonPrice(pricing.price),
            },
          }),
        );
      }
    }

    // 3. Update Certificates (EDIT ONLY)
    if (certificates?.length) {
      for (const cert of certificates) {
        operations.push(
          this.prisma.certificates.updateMany({
            where: {
              id: cert.certificateId,
              doulaProfileId: doulaProfile.id, // ownership safety
            },
            data: {
              ...(cert.data.name !== undefined && { name: cert.data.name }),
              ...(cert.data.issuedBy !== undefined && {
                issuedBy: cert.data.issuedBy,
              }),
              ...(cert.data.year !== undefined && { year: cert.data.year }),
            },
          }),
        );
      }
    }
    await this.prisma.$transaction(operations);
    return {
      message: 'Doula profile updated successfully',
    };
  }

  async recentActivityForZoneManager(userId: string) {
    // 1. Get zone manager profile
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      include: {
        managingRegion: {
          select: { id: true },
        },
      },
    });

    if (!zoneManager) {
      throw new Error('Zone manager profile not found');
    }

    const regionIds = zoneManager.managingRegion.map((r) => r.id);

    /* ----------------------------------------------------
     * 2. Fetch bookings in managed regions
     * -------------------------------------------------- */
    const bookings = await this.prisma.serviceBooking.findMany({
      where: {
        regionId: { in: regionIds },
      },
      include: {
        client: {
          include: {
            user: { select: { name: true } },
          },
        },
        DoulaProfile: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    /* ----------------------------------------------------
     * 3. Fetch meetings hosted by zone manager
     * -------------------------------------------------- */
    const meetings = await this.prisma.meetings.findMany({
      where: {
        zoneManagerProfileId: zoneManager.id,
      },
      include: {
        bookedBy: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    /* ----------------------------------------------------
     * 4. Fetch gallery image additions (optional but useful)
     * -------------------------------------------------- */
    const galleryImages = await this.prisma.doulaGallery.findMany({
      where: {
        doulaProfile: {
          zoneManager: {
            some: { id: zoneManager.id },
          },
        },
      },
      include: {
        doulaProfile: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    /* ----------------------------------------------------
     * 5. Map activities
     * -------------------------------------------------- */
    const bookingActivities: ZoneManagerRecentActivity[] = bookings.flatMap(
      (booking) => {
        const activities: ZoneManagerRecentActivity[] = [];

        // Booking created
        activities.push({
          id: booking.id,
          entityType: 'BOOKING',
          entityId: booking.id,
          action: 'BOOKING_CREATED',
          title: 'New Booking Created',
          description: `${booking.client.user.name} booked ${booking.DoulaProfile.user.name}`,
          date: booking.createdAt,
        });

        // Booking completed
        if (booking.status === 'COMPLETED') {
          activities.push({
            id: booking.id,
            entityType: 'BOOKING',
            entityId: booking.id,
            action: 'BOOKING_COMPLETED',
            title: 'Booking Completed',
            description: `Booking between ${booking.client.user.name} and ${booking.DoulaProfile.user.name} completed`,
            date: booking.updatedAt,
          });
        }

        // Booking canceled
        if (booking.status === 'CANCELED') {
          activities.push({
            id: booking.id,
            entityType: 'BOOKING',
            entityId: booking.id,
            action: 'BOOKING_CANCELED',
            title: 'Booking Canceled',
            description: `Booking between ${booking.client.user.name} and ${booking.DoulaProfile.user.name} was canceled`,
            date: booking.updatedAt,
          });
        }

        return activities;
      },
    );

    const meetingActivities: ZoneManagerRecentActivity[] = meetings.map(
      (meeting) => ({
        id: meeting.id,
        entityType: 'MEETING',
        entityId: meeting.id,
        action: 'MEETING_SCHEDULED',
        title: 'Meeting Scheduled',
        description: `Meeting scheduled with ${meeting.bookedBy.user.name}`,
        date: meeting.createdAt,
      }),
    );

    const galleryActivities: ZoneManagerRecentActivity[] = galleryImages.map(
      (image) => ({
        id: image.id,
        entityType: 'GALLERY',
        entityId: image.id,
        action: 'GALLERY_IMAGE_ADDED',
        title: 'Gallery Image Added',
        description: `New gallery image added for ${image.doulaProfile.user.name}`,
        date: image.createdAt,
      }),
    );

    /* ----------------------------------------------------
     * 6. Merge & sort
     * -------------------------------------------------- */
    return [
      ...bookingActivities,
      ...meetingActivities,
      ...galleryActivities,
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async listZoneUsersWithCommission(
    zoneManagerUserId: string,
    query: ListZoneUsersQueryDto,
  ) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId: zoneManagerUserId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const where: Prisma.ClientProfileWhereInput = {
      OR: [
        {
          bookings: {
            some: {
              OR: [
                {
                  region: {
                    zoneManagerId: zoneManager.id,
                  },
                },
                {
                  DoulaProfile: {
                    zoneManager: {
                      some: {
                        id: zoneManager.id,
                      },
                    },
                  },
                },
              ],
            },
          },
        },
        {
          enquiryForms: {
            some: {
              region: {
                zoneManagerId: zoneManager.id,
              },
            },
          },
        },
      ],
      ...(search
        ? {
          user: {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          },
        }
        : {}),
    };

    const result = await paginate({
      prismaModel: this.prisma.clientProfile,
      page,
      limit,
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    type ZoneClientWithUser = Prisma.ClientProfileGetPayload<{
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            phone: true;
          };
        };
      };
    }>;

    const data = (result.data as ZoneClientWithUser[]).map((profile) => ({
      userId: profile.user.id,
      name: profile.user.name,
      email: profile.user.email,
      phone: profile.user.phone,
      commission: profile.commission,
    }));

    return {
      message: 'Zone users with commission fetched successfully',
      data,
      meta: result.meta,
    };
  }

  async updateZoneUserCommission(
    zoneManagerUserId: string,
    dto: UpdateUserCommissionDto,
  ) {
    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId: zoneManagerUserId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    const profile = await this.prisma.clientProfile.findFirst({
      where: {
        userId: dto.userId,
        OR: [
          {
            bookings: {
              some: {
                region: {
                  zoneManagerId: zoneManager.id,
                },
              },
            },
          },
          {
            enquiryForms: {
              some: {
                region: {
                  zoneManagerId: zoneManager.id,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Client user not found in your assigned regions',
      );
    }

    const updated = await this.prisma.clientProfile.update({
      where: {
        userId: dto.userId,
      },
      data: {
        commission: dto.commission,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      message: 'User commission updated successfully',
      data: {
        userId: updated.user.id,
        name: updated.user.name,
        email: updated.user.email,
        phone: updated.user.phone,
        commission: updated.commission,
      },
    };
  }
}
