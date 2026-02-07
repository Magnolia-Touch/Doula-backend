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
  formatTimeOnly,
  getWeekdayFromDate,
  isMeetingExists,
} from 'src/common/utility/service-utils';
import { RescheduleDto } from './dto/reschedule.dto';
import { cancelDto } from './dto/cancel.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ScheduleDoulaDto, UpdateClientDoulaEnquiryDto } from './dto/schedule-doula.dto';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailerService,


  ) { }

  //common function. used inside enquiry and doula meeting scheduling.
  async scheduleMeeting(
    Form: any,
    clientId: string,
    profileId: string,
    role: Role,
    enquiryId: string,
    slotParentId?: string,

  ) {
    // Generate meet link placeholder (replace with Google Calendar flow later)
    const meetCode = Math.random().toString(36).slice(2, 10);
    // const meetLink = `https://meet.google.com/${meetCode}`;
    const meetLink = `https://bambinidoulas.com/joinmeeting/`;
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
        enquiryId,
        ...profileData,
      },
    });

    const updatedMeeting = await this.prisma.meetings.update({
      where: { id: meeting.id },
      data: {
        link: `${meetLink}/${meeting.id}`,
      },
    });

    await this.mail.sendMail({
      to: Form.email,
      subject: `Confirmation of your Meeting with ${role} for Service ${Form.name}`,
      template: 'meetings',
      context: {
        date: Form.date,
        time: `${formatTimeOnly(updatedMeeting.startTime)} - ${formatTimeOnly(updatedMeeting.endTime)}`,
        meetLink: updatedMeeting.link,
      },
    });

    return updatedMeeting;
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
      createdby?: Role;   // ✅ added
      page?: number;
      limit?: number;
    },
    user: any,
  ) {
    const { startDate, endDate, createdby, status, page = 1, limit = 10 } = params;

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

    if (createdby) {
      where.createdby = createdby;
    }

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
          enquiryId: meeting.enquiryId,
          createdby: meeting.createdby,

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
    // 1️⃣ Fetch meeting by ID only (no role / access restriction)
    const meeting = await this.prisma.meetings.findFirst({
      where: { id },
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
      throw new NotFoundException('Meeting Not Found');
    }

    // 2️⃣ Determine meeting owner (unchanged logic)
    const meetingWith = meeting.doulaProfileId
      ? 'DOULA'
      : meeting.zoneManagerProfileId
        ? 'ZONE_MANAGER'
        : null;

    // 3️⃣ Response mapping (UNCHANGED)
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
      enquiryId: meeting.enquiryId,
      createdby: meeting.createdby,

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

  // async doulasMeetingSchedule(dto: ScheduleDoulaDto, user: any) {
  //   const {
  //     enquiryId,
  //     date,
  //     time,
  //     doulaIds
  //   } = dto;


  //   // 1. Fetch zone manager profile to attach meeting to them
  //   const enquiry = await this.prisma.enquiryForm.findUnique({
  //     where: { id: enquiryId },
  //     select: {
  //       id: true,
  //       additionalNotes: true,
  //       serviceName: true,
  //       clientProfile: { select: { id: true, user: { select: { name: true, email: true, phone: true } } } }
  //     }
  //   });
  //   if (!enquiry) {
  //     throw new ForbiddenException('enquiry not found');
  //   }

  //   const enquiries = await this.prisma.$transaction(
  //     doulaIds.map((doulaId) =>
  //       this.prisma.clientDoulaEnquiries.create({
  //         data: {
  //           clientId: enquiry.clientProfile.id,
  //           doulaProfileId: doulaId,
  //           date: new Date(date),
  //           time: new Date(`1970-01-01T${time}Z`),
  //           notes: dto.notes ?? enquiry.additionalNotes,
  //           serviceName: dto.serviceName ?? enquiry.serviceName,
  //           status: MeetingStatus.SCHEDULED,
  //         },
  //         include: this.includeRelations(),
  //       }),
  //     ),
  //   );


  //   return enquiries.map((enquiry) => this.formatResponse(enquiry));
  // };


  // async doulasMeetingSchedule(dto: ScheduleDoulaDto, user: any) {
  //   const { enquiryId, date, time, doulaIds } = dto;

  //   // 1️⃣ Fetch enquiry (source of truth)
  //   const enquiry = await this.prisma.enquiryForm.findUnique({
  //     where: { id: enquiryId },
  //     select: {
  //       id: true,
  //       additionalNotes: true,
  //       serviceName: true,
  //       clientProfile: {
  //         select: {
  //           id: true,
  //           user: {
  //             select: { name: true, email: true, phone: true },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (!enquiry) {
  //     throw new ForbiddenException('enquiry not found');
  //   }

  //   const meetingDate = new Date(date);
  //   const startTime = new Date(`1970-01-01T${time}Z`);

  //   // ⏱️ TEMP: default 30-min meeting (adjust later if slot system exists)
  //   const endTime = new Date(startTime);
  //   endTime.setMinutes(endTime.getMinutes() + 30);
  //   const meetLink = `https://bambinidoulas.com/joinmeeting/`;
  //   // 2️⃣ Create Meetings instead of ClientDoulaEnquiries
  //   const meetings = await this.prisma.$transaction(
  //     doulaIds.map((doulaId) =>
  //       this.prisma.meetings.create({
  //         data: {
  //           enquiryId: enquiry.id,

  //           bookedById: enquiry.clientProfile.id,
  //           doulaProfileId: doulaId,

  //           date: meetingDate,
  //           startTime,
  //           endTime,

  //           serviceName: dto.serviceName ?? enquiry.serviceName,
  //           remarks: dto.notes ?? enquiry.additionalNotes,
  //           status: MeetingStatus.SCHEDULED,
  //           createdby: Role.ZONE_MANAGER,

  //           // Required non-null column
  //           link: meetLink, // can be populated later when meeting is confirmed
  //         },
  //         include: this.includeRelations(), // unchanged → response safe
  //       }),
  //     ),
  //   );

  //   const updatedMeetings = await this.prisma.$transaction(
  //     meetings.map((meeting) =>
  //       this.prisma.meetings.update({
  //         where: { id: meeting.id },
  //         data: {
  //           link: `${meetLink}/${meeting.id}`,
  //         },
  //       }),
  //     ),
  //   );

  //   // 3️⃣ Keep response identical
  //   return updatedMeetings.map((meeting) => this.formatResponse(meeting));
  // }


  async doulasMeetingSchedule(dto: ScheduleDoulaDto, user: any) {
    const { enquiryId, date, time, doulaIds } = dto;

    this.logger.log(
      `[ScheduleMeeting] START | enquiryId=${enquiryId} | doulaCount=${doulaIds?.length}`,
    );

    // ---------------------------------------------------
    // 1️⃣ Fetch enquiry
    // ---------------------------------------------------
    const enquiry = await this.prisma.enquiryForm.findUnique({
      where: { id: enquiryId },
      select: {
        id: true,
        additionalNotes: true,
        serviceName: true,
        clientProfile: {
          select: {
            id: true,
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
      },
    });

    this.logger.debug(
      `[ScheduleMeeting] Enquiry fetched: ${JSON.stringify({
        enquiryId: enquiry?.id,
        clientProfileId: enquiry?.clientProfile?.id,
        clientUser: enquiry?.clientProfile?.user?.email,
      })}`,
    );

    if (!enquiry) {
      this.logger.error(
        `[ScheduleMeeting] Enquiry not found | enquiryId=${enquiryId}`,
      );
      throw new ForbiddenException('enquiry not found');
    }

    if (!enquiry.clientProfile) {
      this.logger.error(
        `[ScheduleMeeting] clientProfile missing in enquiry`,
      );
      throw new NotFoundException('ClientProfile missing in enquiry');
    }

    const meetingDate = new Date(date);
    const startTime = new Date(`1970-01-01T${time}Z`);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const meetLink = `https://bambinidoulas.com/joinmeeting/`;

    this.logger.debug(
      `[ScheduleMeeting] Creating meetings | date=${meetingDate.toISOString()} | start=${startTime.toISOString()}`
    );

    // ---------------------------------------------------
    // 2️⃣ Create meetings
    // ---------------------------------------------------
    const meetings = await this.prisma.$transaction(
      doulaIds.map((doulaId) => {
        this.logger.debug(
          `[ScheduleMeeting] Creating meeting for doula=${doulaId}`,
        );

        return this.prisma.meetings.create({
          data: {
            enquiryId: enquiry.id,
            bookedById: enquiry.clientProfile.id,
            doulaProfileId: doulaId,
            date: meetingDate,
            startTime,
            endTime,
            serviceName: dto.serviceName ?? enquiry.serviceName,
            remarks: dto.notes ?? enquiry.additionalNotes,
            status: MeetingStatus.SCHEDULED,
            createdby: Role.ZONE_MANAGER,
            link: meetLink,
          },
          include: this.includeRelations(),
        });
      }),
    );

    this.logger.debug(
      `[ScheduleMeeting] Meetings created: ${meetings.length}`,
    );

    meetings.forEach((m) => {
      this.logger.debug(
        `[ScheduleMeeting] Created meeting relations | id=${m.id} | bookedBy=${!!m.bookedBy} | doula=${!!m.DoulaProfile}`,
      );
    });

    // ---------------------------------------------------
    // 3️⃣ Update links
    // ---------------------------------------------------
    const updatedMeetings = await this.prisma.$transaction(
      meetings.map((meeting) =>
        this.prisma.meetings.update({
          where: { id: meeting.id },
          data: {
            link: `${meetLink}/${meeting.id}`,
          },
          include: this.includeRelations(),
        }),
      ),
    );

    this.logger.debug(
      `[ScheduleMeeting] Links updated for meetings`,
    );

    return updatedMeetings.map((meeting) =>
      this.formatMeetingResponse(meeting),
    );


  }


  /* -------------------------------- FIND ALL -------------------------------- */
  // async doulaMeeings(
  //   userId: string,
  //   role: Role,
  //   page = 1,
  //   limit = 10,
  // ) {

  //   let where: any = {};
  //   if (role === Role.ZONE_MANAGER) {
  //     where = {
  //       DoulaProfile: {
  //         zoneManager: {
  //           some: { userId }
  //         }
  //       }
  //     }
  //   }
  //   if (role === Role.DOULA) {
  //     where = {
  //       DoulaProfile: {
  //         userId: userId
  //       }
  //     }
  //   }

  //   const result = await paginate({
  //     prismaModel: this.prisma.clientDoulaEnquiries,
  //     page,
  //     limit,
  //     include: this.includeRelations(),
  //     where,
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   return {
  //     data: result.data.map((enquiry) => this.formatResponse(enquiry)),
  //     meta: result.meta,
  //   };
  // }


  async doulaMeeings(
    userId: string,
    role: Role,
    page = 1,
    limit = 10,
  ) {
    let where: any = {};

    if (role === Role.ZONE_MANAGER) {
      where = {
        DoulaProfile: {
          zoneManager: {
            some: { userId },
          },
        },
      };
    }

    if (role === Role.DOULA) {
      where = {
        DoulaProfile: {
          userId,
        },
      };
    }

    const result = await paginate({
      prismaModel: this.prisma.meetings, // 🔁 switched
      page,
      limit,
      include: this.includeRelations(), // unchanged
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: result.data.map((meeting) => this.formatResponse(meeting)),
      meta: result.meta,
    };
  }


  /* -------------------------------- FIND ONE -------------------------------- */
  // async doulaMeeingsRetrieve(id: string) {
  //   const enquiry = await this.prisma.clientDoulaEnquiries.findUnique({
  //     where: { id, },
  //     include: this.includeRelations(),
  //   });

  //   if (!enquiry) {
  //     throw new NotFoundException('Client–Doula enquiry not found');
  //   }

  //   return this.formatResponse(enquiry);
  // }

  async doulaMeeingsRetrieve(id: string) {
    const meeting = await this.prisma.meetings.findUnique({
      where: { id },
      include: this.includeRelations(), // unchanged
    });

    if (!meeting) {
      throw new NotFoundException('Client–Doula meeting not found');
    }

    return this.formatResponse(meeting);
  }


  /* -------------------------------- UPDATE -------------------------------- */
  // async updateDoulaMeeting(id: string, dto: UpdateClientDoulaEnquiryDto, userId: string) {
  //   const existing = await this.prisma.clientDoulaEnquiries.findUnique({
  //     where: { id, DoulaProfile: { zoneManager: { some: { userId: userId } } } },
  //   });

  //   if (!existing) {
  //     throw new NotFoundException('Enquiry not found');
  //   }

  //   const { date, time, notes, doulaId } = dto;

  //   const enquiry = await this.prisma.clientDoulaEnquiries.update({
  //     where: { id },
  //     data: {
  //       date: dto.date ? new Date(dto.date) : undefined,
  //       time: dto.time
  //         ? new Date(`1970-01-01T${dto.time}Z`)
  //         : undefined,
  //       notes: dto.notes,
  //       doulaProfileId: dto.doulaId,
  //     },
  //     include: this.includeRelations(),
  //   });


  //   return this.formatResponse(enquiry);
  // }

  async updateDoulaMeeting(
    id: string,
    dto: UpdateClientDoulaEnquiryDto,
    userId: string,
  ) {
    const existing = await this.prisma.meetings.findFirst({
      where: {
        id,
        DoulaProfile: {
          zoneManager: {
            some: { userId },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Meeting not found');
    }

    const startTime = dto.time
      ? new Date(`1970-01-01T${dto.time}Z`)
      : undefined;

    const endTime =
      startTime
        ? new Date(startTime.getTime() + 30 * 60 * 1000)
        : undefined;

    const meeting = await this.prisma.meetings.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        startTime,
        endTime,
        remarks: dto.notes,
        doulaProfileId: dto.doulaId,
      },
      include: this.includeRelations(),
    });

    return this.formatResponse(meeting);
  }

  /* -------------------------------- DELETE -------------------------------- */
  // async deleteDoulaMeeting(id: string, userId: string) {
  //   await this.doulaMeeingsRetrieve(id);

  //   await this.prisma.clientDoulaEnquiries.delete({
  //     where: { id, DoulaProfile: { zoneManager: { some: { userId: userId } } } },
  //   });

  //   return { message: 'Enquiry deleted successfully' };
  // }

  async deleteDoulaMeeting(id: string, userId: string) {
    await this.doulaMeeingsRetrieve(id);

    await this.prisma.meetings.delete({
      where: {
        id,
        DoulaProfile: {
          zoneManager: {
            some: { userId },
          },
        },
      },
    });

    return { message: 'Enquiry deleted successfully' };
  }


  // async updateDoulaMeetingsStatus(id: string, userId: string, role: Role, status: MeetingStatus) {
  //   // 1. Fetch enquiry with relations
  //   const enquiry = await this.prisma.clientDoulaEnquiries.findUnique({
  //     where: { id },
  //     include: {
  //       DoulaProfile: {
  //         include: {
  //           zoneManager: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!enquiry) {
  //     throw new NotFoundException('Client–Doula enquiry not found');
  //   }

  //   // 2. Authorization check
  //   if (
  //     role === Role.ZONE_MANAGER &&
  //     !enquiry.DoulaProfile.zoneManager.some(
  //       (zm) => zm.userId === userId,
  //     )
  //   ) {
  //     throw new ForbiddenException('Access denied');
  //   }

  //   if (
  //     role === Role.DOULA &&
  //     enquiry.DoulaProfile.userId !== userId
  //   ) {
  //     throw new ForbiddenException('Access denied');
  //   }

  //   // 3. Update status
  //   const updated = await this.prisma.clientDoulaEnquiries.update({
  //     where: { id },
  //     data: { status },
  //     include: this.includeRelations(),
  //   });

  //   return this.formatResponse(updated);

  // }
  async updateDoulaMeetingsStatus(
    id: string,
    userId: string,
    role: Role,
    status: MeetingStatus,
  ) {
    const meeting = await this.prisma.meetings.findUnique({
      where: { id },
      include: {
        DoulaProfile: {
          include: {
            zoneManager: true,
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Client–Doula meeting not found');
    }

    if (
      role === Role.ZONE_MANAGER &&
      !meeting.DoulaProfile?.zoneManager.some(
        (zm) => zm.userId === userId,
      )
    ) {
      throw new ForbiddenException('Access denied');
    }

    if (
      role === Role.DOULA &&
      meeting.DoulaProfile?.userId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.meetings.update({
      where: { id },
      data: { status },
      include: this.includeRelations(),
    });

    return this.formatResponse(updated);
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

  private includeRelations() {
    return {
      bookedBy: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      DoulaProfile: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      enquiry: true,
    };
  }

  private formatResponse(enquiry: any) {
    return {
      id: enquiry.id,
      clientId: enquiry.clientId,
      clientName: enquiry.ClientProfile.user.name,
      clientEmail: enquiry.ClientProfile.user.email,
      clientPhone: enquiry.ClientProfile.user.phone,
      clientAddress: enquiry.ClientProfile.address,

      doulaId: enquiry.DoulaProfile.id,
      doulaName: enquiry.DoulaProfile.user.name,
      doulaEmail: enquiry.DoulaProfile.user.email,

      date: enquiry.date,
      time: enquiry.time,
      notes: enquiry.notes,
      status: enquiry.status,
      serviceName: enquiry.serviceName
    };
  }

  private formatMeetingResponse(meeting: any) {
    return {
      id: meeting.id,

      // --- Meeting core ---
      link: meeting.link,
      status: meeting.status,
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      serviceName: meeting.serviceName,
      remarks: meeting.remarks,

      createdBy: meeting.createdby,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt,
      cancelledAt: meeting.cancelledAt,
      rescheduledAt: meeting.rescheduledAt,

      // --- Enquiry ---
      enquiryId: meeting.enquiryId,

      // --- Client ---
      clientId: meeting.bookedBy?.id ?? null,
      clientName: meeting.bookedBy?.user?.name ?? null,
      clientEmail: meeting.bookedBy?.user?.email ?? null,
      clientPhone: meeting.bookedBy?.user?.phone ?? null,
      clientAddress: meeting.bookedBy?.address ?? null,

      // --- Doula ---
      doulaId: meeting.DoulaProfile?.id ?? null,
      doulaName: meeting.DoulaProfile?.user?.name ?? null,
      doulaEmail: meeting.DoulaProfile?.user?.email ?? null,

      // --- Zone Manager ---
      zoneManagerId: meeting.ZoneManagerProfile?.id ?? null,
      zoneManagerName:
        meeting.ZoneManagerProfile?.user?.name ?? null,

      // --- Admin ---
      adminId: meeting.AdminProfile?.id ?? null,
      adminName: meeting.AdminProfile?.user?.name ?? null,

      // --- Service ---
      serviceId: meeting.Service?.id ?? null,
      serviceTitle: meeting.Service?.title ?? null,

      // --- Slot ---
      availableSlotId: meeting.availableSlotsForMeetingId ?? null,
    };
  }

  //---------------------------------------------
  // update - 1
  //---------------------------------------------


  //---------------------------------------------
  // update - 1
  //---------------------------------------------

  async createMeetingForClientAndDoula(dto: CreateMeetingDto, doulaUserId: string) {
    const enquiry = await this.prisma.enquiryForm.findUnique({
      where: { id: dto.enquiryId },
      include: { region: { include: { zoneManager: { include: { user: true } } } } },
    });

    if (!enquiry) {
      throw new BadRequestException('enquiry not found');
    }

    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { id: enquiry.clientId },
      include: { user: true },
    });

    if (!clientProfile) {
      throw new BadRequestException('Client profile not found');
    }

    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: doulaUserId },
      include: { user: true },
    });

    if (!doulaProfile) {
      throw new BadRequestException('Doula profile not found');
    }

    const date = new Date(dto.date);
    const meetLink = `https://bambinidoulas.com/joinmeeting/`;
    const startTime = new Date(`${dto.date}T${dto.startTime}:00`);
    const endTime = new Date(`${dto.date}T${dto.endTime}:00`);

    const meeting = await this.prisma.meetings.create({
      data: {
        date,
        startTime,
        endTime,
        status: MeetingStatus.SCHEDULED,
        serviceName: dto.serviceName,
        remarks: dto.remarks,
        bookedById: clientProfile.id,
        doulaProfileId: doulaProfile.id,
        link: meetLink,
        createdby: Role.DOULA
      },
    });
    const updatedMeeting = await this.prisma.meetings.update({
      where: { id: meeting.id },
      data: {
        link: `${meetLink}/${meeting.id}`,
      },
    });


    await Promise.all([
      /** SEND MAIL TO CLIENT */
      this.mail.sendMail({
        to: clientProfile.user.email,
        subject: 'Your Meeting Has Been Scheduled',
        template: 'meeting-scheduled-to-client',
        context: {
          clientName: clientProfile.user.name,
          doulaName: doulaProfile.user.name,
          serviceName: dto.serviceName,
          date: date.toDateString(),
          startTime: dto.startTime,
          endTime: dto.endTime,
          meetingLink: updatedMeeting.link,
        },
      }),

      /** SEND MAIL TO ZONE MANAGER */
      this.mail.sendMail({
        to: enquiry.region.zoneManager?.user?.email,
        subject: 'Meeting Scheduled: Client & Doula',
        template: 'meeting-scheduled-to-zm',
        context: {
          clientName: clientProfile.user.name,
          serviceName: dto.serviceName,
          doulaName: doulaProfile.user.name,
          date: date.toDateString(),
          startTime: dto.startTime,
          endTime: dto.endTime,
          meetingLink: updatedMeeting.link,
        },
      }),
    ]);

    return {
      message: 'Meeting created successfully',
      updatedMeeting,
    };
  }


}