import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/common/utility/pagination.util';
import { MeetingStatus, Role } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import {
  findServiceOrThrowwithId,
  findSlotOrThrow,
  getWeekdayFromDate,
  isMeetingExists,
} from 'src/common/utility/service-utils';
import { RescheduleDto } from './dto/reschedule.dto';
import { cancelDto } from './dto/cancel.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ScheduleDoulaDto } from './dto/schedule-doula.dto';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailerService,
  ) {}

  //common function. used inside enquiry and doula meeting scheduling.
  async scheduleMeeting(
    Form: any,
    clientId: string,
    profileId: string,
    role: Role,
    slotParentId?: string,
  ) {
    // Generate meet link placeholder (replace with Google Calendar flow later)
    const meetCode = Math.random().toString(36).slice(2, 10);
    const meetLink = `https://meet.google.com/${meetCode}`;
    // Dynamically decide which profile field to set
    const profileData: any = {};

    if (role === Role.ZONE_MANAGER) {
      profileData.zoneManagerProfileId = profileId;
    } else if (role === Role.DOULA) {
      profileData.doulaProfileId = profileId;
    } else if (role === Role.ADMIN) {
      profileData.adminProfileId = profileId;
    }
    console.log('form', Form);

    // create meeting
    const meeting = await this.prisma.meetings.create({
      data: {
        link: meetLink,
        status: MeetingStatus.SCHEDULED,
        startTime: Form.startTime,
        endTime: Form.endTime,
        date: Form.date,
        serviceName: Form.serviceName,
        remarks: Form.additionalNotes,
        bookedById: clientId,
        availableSlotsForMeetingId: slotParentId,
        ...profileData,
      },
    });
    console.log('meeting created succesfull');
    // 8. Send Mail
    await this.mail.sendMail({
      to: Form.email,
      subject: `Confirmation of your Meeting with ${role} for Service ${Form.name}`,
      template: 'meetings',
      context: {
        date: Form.date,
        time: meeting.startTime + ' - ' + meeting.endTime,
        meetLink: meetLink,
      },
    });
    return meeting;
  }

  // Get meetings with optional date and status filters
  // doula have meeting
  // zone manager have meeting
  // admin have meeting
  // role and userId can be retreived from user.
  // take meetings with that profile id
  //filter with startDate endDate, status.
  async getMeetings(
    params: {
      startDate?: string;
      endDate?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
    user: any,
  ) {
    const { startDate, endDate, status, page = 1, limit = 10 } = params;

    // 1️⃣ Resolve profile based on role
    let profile: any = null;

    if (user.role === Role.ZONE_MANAGER) {
      profile = await this.prisma.zoneManagerProfile.findUnique({
        where: { userId: user.id },
      });
    } else if (user.role === Role.DOULA) {
      profile = await this.prisma.doulaProfile.findUnique({
        where: { userId: user.id },
      });
    } else if (user.role === Role.ADMIN) {
      profile = await this.prisma.adminProfile.findUnique({
        where: { userId: user.id },
      });
    }

    if (!profile) {
      throw new NotFoundException('Profile Not Found');
    }

    // 2️⃣ Build WHERE clause
    const where: any = {};

    if (status) where.status = status;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    if (user.role === Role.ZONE_MANAGER) {
      where.zoneManagerProfileId = profile.id;
    } else if (user.role === Role.DOULA) {
      where.doulaProfileId = profile.id;
    } else if (user.role === Role.ADMIN) {
      where.adminProfileId = profile.id;
    }

    // 3️⃣ Fetch paginated meetings
    const result = await paginate({
      prismaModel: this.prisma.meetings,
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        AvailableSlotsForMeeting: {
          select: { weekday: true },
        },

        bookedBy: {
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
            userId: true,
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

        ZoneManagerProfile: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // 4️⃣ Transform response inline
    return {
      ...result,
      data: result.data.map((meeting: any) => {
        const meetingWith = meeting.doulaProfileId
          ? 'DOULA'
          : meeting.zoneManagerProfileId
            ? 'ZONE_MANAGER'
            : null;

        return {
          // ===== MEETING =====
          meetingId: meeting.id,
          meetingLink: meeting.link,
          meetingStatus: meeting.status,
          meetingStartTime: meeting.startTime,
          meetingEndTime: meeting.endTime,
          meetingDate: meeting.date,
          weekday: meeting.AvailableSlotsForMeeting?.weekday ?? null,
          serviceName: meeting.serviceName,
          remarks: meeting.remarks,

          meeting_with: meetingWith,

          // ===== CLIENT =====
          client: {
            clientId: meeting.bookedBy?.id,
            clientName: meeting.bookedBy?.user?.name,
            clientEmail: meeting.bookedBy?.user?.email,
            clientPhone: meeting.bookedBy?.user?.phone,
          },

          // ===== DOULA =====
          doula:
            meetingWith === 'DOULA'
              ? {
                  doulaId: meeting.DoulaProfile?.user?.id,
                  doulaProfileId: meeting.DoulaProfile?.id,
                  doulaName: meeting.DoulaProfile?.user?.name,
                  doulaEmail: meeting.DoulaProfile?.user?.email,
                  doulaPhone: meeting.DoulaProfile?.user?.phone,
                }
              : null,

          // ===== ZONE MANAGER =====
          zoneManager:
            meetingWith === 'ZONE_MANAGER'
              ? {
                  zoneManagerId: meeting.ZoneManagerProfile?.user?.id,
                  zoneManagerProfileId: meeting.ZoneManagerProfile?.id,
                  zoneManagerName: meeting.ZoneManagerProfile?.user?.name,
                  zoneManagerEmail: meeting.ZoneManagerProfile?.user?.email,
                }
              : null,
        };
      }),
    };
  }

  async getMeetingById(id: string, user: any) {
    // 1️⃣ Resolve profile based on role
    let profile: any = null;

    if (user.role === Role.ZONE_MANAGER) {
      profile = await this.prisma.zoneManagerProfile.findUnique({
        where: { userId: user.id },
      });
    } else if (user.role === Role.DOULA) {
      profile = await this.prisma.doulaProfile.findUnique({
        where: { userId: user.id },
      });
    } else if (user.role === Role.ADMIN) {
      profile = await this.prisma.adminProfile.findUnique({
        where: { userId: user.id },
      });
    }

    if (!profile) {
      throw new NotFoundException('Profile Not Found');
    }

    // 2️⃣ Build access-controlled WHERE clause
    const where: any = { id };

    if (user.role === Role.ZONE_MANAGER) {
      where.zoneManagerProfileId = profile.id;
    } else if (user.role === Role.DOULA) {
      where.doulaProfileId = profile.id;
    } else if (user.role === Role.ADMIN) {
      where.adminProfileId = profile.id;
    }

    // 3️⃣ Fetch meeting
    const meeting = await this.prisma.meetings.findFirst({
      where,
      include: {
        AvailableSlotsForMeeting: {
          select: { weekday: true },
        },

        bookedBy: {
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
            userId: true,
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

        ZoneManagerProfile: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting Not Found or Access Denied');
    }

    // 4️⃣ Inline response mapping
    const meetingWith = meeting.doulaProfileId
      ? 'DOULA'
      : meeting.zoneManagerProfileId
        ? 'ZONE_MANAGER'
        : null;

    return {
      // ===== MEETING =====
      meetingId: meeting.id,
      meetingLink: meeting.link,
      meetingStatus: meeting.status,
      meetingStartTime: meeting.startTime,
      meetingEndTime: meeting.endTime,
      meetingDate: meeting.date,
      weekday: meeting.AvailableSlotsForMeeting?.weekday ?? null,
      serviceName: meeting.serviceName,
      remarks: meeting.remarks,

      meeting_with: meetingWith,

      // ===== CLIENT =====
      client: {
        clientId: meeting.bookedBy?.id,
        clientName: meeting.bookedBy?.user?.name,
        clientEmail: meeting.bookedBy?.user?.email,
        clientPhone: meeting.bookedBy?.user?.phone,
      },

      // ===== DOULA =====
      doula:
        meetingWith === 'DOULA'
          ? {
              doulaId: meeting.DoulaProfile?.user?.id,
              doulaProfileId: meeting.DoulaProfile?.id,
              doulaName: meeting.DoulaProfile?.user?.name,
              doulaEmail: meeting.DoulaProfile?.user?.email,
              doulaPhone: meeting.DoulaProfile?.user?.phone,
            }
          : null,

      // ===== ZONE MANAGER =====
      zoneManager:
        meetingWith === 'ZONE_MANAGER'
          ? {
              zoneManagerId: meeting.ZoneManagerProfile?.user?.id,
              zoneManagerProfileId: meeting.ZoneManagerProfile?.id,
              zoneManagerName: meeting.ZoneManagerProfile?.user?.name,
              zoneManagerEmail: meeting.ZoneManagerProfile?.user?.email,
            }
          : null,
    };
  }

  // Reschedule meeting to new slot
  //any meeting can be cancelled by admin
  //zone manager can cancel only their meeting and meetings of their associated doulas' meeting only
  async rescheduleMeeting(dto: RescheduleDto, user: any) {
    // STEP 1: Fetch meeting with doula + zone manager relation
    const meeting = await this.prisma.meetings.findUnique({
      where: { id: dto.meetingId },
      include: {
        DoulaProfile: {
          include: {
            zoneManager: true, // needed to check if doula belongs to the zone manager,
          },
        },
      },
    });

    if (!meeting) throw new NotFoundException('Meeting not found');

    // ========= ADMIN: CAN RESCHEDULE ANY MEETING =========
    if (user.role === Role.ADMIN) {
      // allowed → skip checks
    }

    // ========= ZONE MANAGER LOGIC =========
    else if (user.role === Role.ZONE_MANAGER) {
      // fetch zone manager profile
      const zoneManagerProfile =
        await this.prisma.zoneManagerProfile.findUnique({
          where: { userId: user.id },
          include: { doulas: true },
        });

      if (!zoneManagerProfile)
        throw new ForbiddenException('Zone Manager profile not found');

      const zoneManagerId = zoneManagerProfile.id;

      // Condition 1 → Meeting is directly under this Zone Manager
      const ownsMeeting = meeting.zoneManagerProfileId === zoneManagerId;

      // Condition 2 → Meeting belongs to their doula
      const doulaBelongsToZoneManager = zoneManagerProfile.doulas.some(
        (d) => d.id === meeting.doulaProfileId,
      );

      if (!ownsMeeting && !doulaBelongsToZoneManager) {
        throw new ForbiddenException(
          "You can reschedule only your meetings or your doulas' meetings",
        );
      }
    }

    // ========= OTHER ROLES → BLOCKED =========
    else {
      throw new ForbiddenException(
        'You are not allowed to reschedule meetings',
      );
    }
    const [startTime, endTime] = dto.meetingsTimeSlots.split('-');

    if (!startTime || !endTime) {
      throw new Error('Invalid time slot format. Expected HH:mm-HH:mm');
    }
    const startDateTime = new Date(`${dto.meetingsDate}T${startTime}:00`);
    const endDateTime = new Date(`${dto.meetingsDate}T${startTime}:00`);

    // ========= STEP 4: Update meeting slot =========
    const updated = await this.prisma.meetings.update({
      where: { id: dto.meetingId },
      data: {
        startTime: startDateTime,
        endTime: endDateTime,
        date: new Date(dto.meetingsDate),
        rescheduledAt: new Date(),
        status: MeetingStatus.SCHEDULED,
      },
    });
    return updated;
  }

  async updateMeetingStatus(dto: UpdateStatusDto, userId: string) {
    const { status, meetingId } = dto;
    const meeting = await this.prisma.meetings.findFirst({
      where: {
        id: meetingId,
        OR: [
          {
            ZoneManagerProfile: { userId: userId },
          },
          {
            DoulaProfile: { userId: userId },
          },
        ],
      },
      select: { status: true },
    });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    const updated = await this.prisma.meetings.update({
      where: { id: dto.meetingId },
      data: {
        status: dto.status,
        cancelledAt: dto.status === MeetingStatus.CANCELED ? new Date() : null,
      },
    });
    return {
      message: 'Meeting status updated',
      meeting: updated,
    };
  }

  async deleteAllMeetings(user: any) {
    // Allow only Admin
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only Admin can perform bulk deletion');
    }
    // Free all meeting slots first
    await this.prisma.availableSlotsTimeForMeeting.updateMany({
      data: {
        isBooked: false,
        availabe: true,
      },
    });
    // Delete all meetings
    const result = await this.prisma.meetings.deleteMany({});
    return {
      message: 'All meetings deleted successfully',
      count: result.count,
    };
  }

  async doulasMeetingSchedule(dto: ScheduleDoulaDto, user: any) {
    const {
      clientId,
      serviceName,
      meetingsDate,
      meetingsTimeSlots,
      doulaId,
      additionalNotes,
      serviceId,
    } = dto;
    // Only Zone Manager is allowed
    console.log(user);
    if (user.role !== Role.ZONE_MANAGER) {
      throw new ForbiddenException(
        'Only Zone Manager can schedule doula meetings',
      );
    }
    // 1. Fetch zone manager profile to attach meeting to them
    const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!zoneManagerProfile) {
      throw new ForbiddenException('Zone Manager profile not found');
    }
    // 2. Fetch doula profile
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { id: doulaId },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const doulaUser = await this.prisma.user.findUnique({
      where: { id: doulaProfile.userId },
    });

    if (!doulaUser) {
      throw new NotFoundException('Doula user not found');
    }

    const weekday = await getWeekdayFromDate(meetingsDate);

    const slot = await findSlotOrThrow(this.prisma, {
      ownerRole: Role.DOULA,
      ownerProfileId: doulaProfile.id,
      weekday,
    });

    console.log('slot', slot);

    // const weekday = await getWeekdayFromDate(dto.meetingsDate)
    const exists = await isMeetingExists(
      this.prisma,
      new Date(meetingsDate),
      meetingsTimeSlots,
      {
        doulaProfileId: doulaProfile.id,
      },
    );
    if (exists) {
      throw new BadRequestException(
        'Meeting already exists for this time slot',
      );
    }
    // create meeting
    const meetCode = Math.random().toString(36).slice(2, 10);
    const meetLink = `https://meet.google.com/${meetCode}`;

    const [startTime, endTime] = meetingsTimeSlots.split('-');

    if (!startTime || !endTime) {
      throw new Error('Invalid time slot format. Expected HH:mm-HH:mm');
    }
    const startDateTime = new Date(`${meetingsDate}T${startTime}:00`);
    const endDateTime = new Date(`${meetingsDate}T${startTime}:00`);

    const meeting = await this.prisma.meetings.create({
      data: {
        link: meetLink,
        status: MeetingStatus.SCHEDULED,
        startTime: startDateTime,
        endTime: endDateTime,
        date: new Date(meetingsDate),
        serviceName: serviceName,
        remarks: additionalNotes,
        bookedById: clientId,
        availableSlotsForMeetingId: slot.id,
        doulaProfileId: doulaProfile.id,
        serviceId: serviceId,
      },
    });

    console.log('meeting created succesfull');

    return {
      message: 'Doula meeting scheduled successfully',
      meeting,
    };
  }

  async findAllmeetings() {
    return this.prisma.meetings.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        bookedBy: true,
        AvailableSlotsForMeeting: true,
        ZoneManagerProfile: true,
        DoulaProfile: true,
        AdminProfile: true,
        Service: true,
      },
    });
  }

  async getBookedMeetingsByDate(params: {
    doulaProfileId?: string;
    zoneManagerProfileId?: string;
    date: string;
  }) {
    const { doulaProfileId, zoneManagerProfileId, date } = params;

    if (!doulaProfileId && !zoneManagerProfileId) {
      throw new BadRequestException(
        'Either doulaProfileId or zoneManagerProfileId is required',
      );
    }

    if (doulaProfileId && zoneManagerProfileId) {
      throw new BadRequestException(
        'Provide only one: doulaProfileId OR zoneManagerProfileId',
      );
    }

    // Normalize date range (start & end of the day)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Build where condition
    const where: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        notIn: [MeetingStatus.CANCELED], // adjust if needed
      },
    };

    if (doulaProfileId) {
      where.doulaProfileId = doulaProfileId;
    }

    if (zoneManagerProfileId) {
      where.zoneManagerProfileId = zoneManagerProfileId;
    }

    const meetings = await this.prisma.meetings.findMany({
      where,
      select: {
        date: true,
        startTime: true,
        endTime: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return {
      date,
      totalBookedSlots: meetings.length,
      bookings: meetings.map((m) => ({
        meetingDate: m.date,
        startTime: m.startTime,
        endTime: m.endTime,
      })),
    };
  }
}
