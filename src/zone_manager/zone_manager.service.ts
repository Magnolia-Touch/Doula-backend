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
} from 'src/common/utility/service-utils';
import { UpdateZoneManagerRegionDto } from './dto/update-zone-manager.dto';

@Injectable()
export class ZoneManagerService {
  constructor(private prisma: PrismaService) {}

  // Create new Zone Manager
  async create(dto: CreateZoneManagerDto, profileImageUrl?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    console.log('regionIds', dto.regionIds);
    const regions = await this.prisma.region.findMany({
      where: { id: { in: dto.regionIds } },
    });
    if (regions.length != dto.regionIds.length) {
      throw new NotFoundException('One or more region IDs are invalid');
    }

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
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

  async get(page = 1, limit = 10, search?: string) {
    const where = {
      role: Role.ZONE_MANAGER,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            {
              zonemanagerprofile: {
                managingRegion: {
                  some: {
                    regionName: {
                      contains: search.toLowerCase(),
                    },
                  },
                },
              },
            },
          ]
        : undefined,
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

    await this.prisma.user.delete({ where: { id } });

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
      status?: ServiceStatus;
      serviceName?: string;
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

    // ✅ Filter by service status
    if (filters?.status) {
      where.status = filters.status;
    }

    // ✅ Filter by date (Schedules.date is @db.Date)
    if (filters?.date) {
      where.date = new Date(filters.date);
    }

    // ✅ Filter by service name
    if (filters?.serviceName) {
      where.ServicePricing = {
        service: {
          name: {
            contains: filters.serviceName.toLowerCase(),
          },
        },
      };
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
        const durationMs =
          schedule.endTime.getTime() - schedule.startTime.getTime();

        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = (durationMs % (1000 * 60 * 60)) / (1000 * 60);

        return {
          scheduleId: schedule.id,
          clientId: schedule.client.id,
          clientName: schedule.client.user.name,

          doulaId: schedule.DoulaProfile.id,
          doulaName: schedule.DoulaProfile.user.name,

          serviceName: schedule.ServicePricing.service.name,

          startDate: schedule.startTime,
          endDate: schedule.endTime,

          duration: `${durationHours}h ${durationMinutes}m`, // dummy / derived
          status: schedule.status,
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

      if (filters.startDate) {
        where.AND.push({
          endDate: {
            gte: new Date(filters.startDate),
          },
        });
      }

      if (filters.endDate) {
        where.AND.push({
          startDate: {
            lte: new Date(filters.endDate),
          },
        });
      }
    }

    /**
     * Filter: Service name
     */
    if (filters?.serviceName) {
      where.service = {
        service: {
          name: {
            contains: filters.serviceName.toLowerCase(),
          },
        },
      };
    }

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

        doulaId: booking.DoulaProfile.id,
        doulaName: booking.DoulaProfile.user.name,

        servicePricingId: booking.service.id,
        serviceName: booking.service.service.name,

        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
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
        { zoneManagerProfileId: zoneManager.id },
        { doulaProfileId: { in: doulaIds } },
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

    if (status) {
      where.AND.push({
        status: status,
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

        startDate: meeting.startTime,
        endDate: meeting.endTime,
        status: meeting.status,
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
            user: { select: { id: true, name: true } },
          },
        },
        DoulaProfile: {
          include: {
            user: { select: { id: true, name: true } },
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

    const durationMs =
      schedule.endTime.getTime() - schedule.startTime.getTime();

    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = (durationMs % (1000 * 60 * 60)) / (1000 * 60);

    return {
      success: true,
      message: 'Schedule fetched successfully',
      data: {
        clientId: schedule.client.id,
        clientName: schedule.client.user.name,

        doulaId: schedule.DoulaProfile.id,
        doulaName: schedule.DoulaProfile.user.name,

        serviceName: schedule.ServicePricing.service.name,

        startDate: schedule.startTime,
        endDate: schedule.endTime,
        duration: `${durationHours}h ${durationMinutes}m`,
        status: schedule.status,
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
        clientId: booking.client.id,
        clientName: booking.client.user.name,

        doulaId: booking.DoulaProfile.id,
        doulaName: booking.DoulaProfile.user.name,

        servicePricingId: booking.service.id,
        serviceName: booking.service.service.name,

        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
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
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return {
      success: true,
      message: 'Meeting fetched successfully',
      data: {
        clientId: meeting.bookedBy.id,
        clientName: meeting.bookedBy.user.name,

        doulaId: meeting.DoulaProfile?.id ?? null,
        doulaName: meeting.DoulaProfile?.user.name ?? null,

        servicePricingId: meeting.serviceId ?? null,
        serviceName: meeting.Service?.name ?? meeting.serviceName,

        startDate: meeting.startTime,
        endDate: meeting.endTime,
        status: meeting.status,
      },
    };
  }
}
