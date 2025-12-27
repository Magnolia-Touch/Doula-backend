import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AvailableSlotsForMeetingDto,
  UpdateSlotsForMeetingTimeDto,
} from './dto/meeting-avail.dto';
import {
  findDoulaOrThrowWithId,
  findRegionOrThrow,
  findUserOrThrowwithId,
  findUserRoleById,
  getSlotOrCreateSlot,
} from 'src/common/utility/service-utils';
import { paginate } from 'src/common/utility/pagination.util';
import { format } from 'date-fns';
import { Prisma, Role, WeekDays } from '@prisma/client';
import { MarkOffDaysDto } from './dto/off-days.dto';
import { GetAvailabilityDto } from './dto/get-availability.dto';
import { resolveAvailabilityOverlap } from './availability-time-resolver.util';

type TimeSlot = {
  startTime: Date;
  endTime: Date;
};


@Injectable()
export class AvailableSlotsService {
  constructor(private prisma: PrismaService) { }

  private toMinutesinUtc(date: Date): number {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  }

  private fromMinutes(baseDate: Date, minutes: number): Date {
    const d = new Date(baseDate);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMinutes(minutes);
    return d;
  }

  private splitInto30MinSlots(
    slot: { startTime: Date; endTime: Date },
    baseDate: Date,
  ): { startTime: Date; endTime: Date }[] {
    const slots: { startTime: Date; endTime: Date }[] = [];

    let start = this.toMinutesinUtc(slot.startTime);
    const end = this.toMinutesinUtc(slot.endTime);

    while (start + 30 <= end) {
      slots.push({
        startTime: this.fromMinutes(baseDate, start),
        endTime: this.fromMinutes(baseDate, start + 30),
      });
      start += 30;
    }

    return slots;
  }


  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async createAvailability(dto: AvailableSlotsForMeetingDto, user: any) {
    let profile: any;

    switch (user.role) {
      case Role.ZONE_MANAGER:
        profile = await this.prisma.zoneManagerProfile.findUnique({
          where: { userId: user.id },
        });
        break;

      case Role.DOULA:
        profile = await this.prisma.doulaProfile.findUnique({
          where: { userId: user.id },
        });
        break;

      case Role.ADMIN:
        profile = await this.prisma.adminProfile.findUnique({
          where: { userId: user.id },
        });
        break;

      default:
        throw new ForbiddenException('Invalid user role');
    }

    const { weekday, startTime, endTime } = dto;
    const startMinutes = this.toMinutes(startTime);
    const endMinutes = this.toMinutes(endTime);

    if (endMinutes <= startMinutes) {
      throw new BadRequestException(
        'End time must be greater than start time',
      );
    }

    const duration = endMinutes - startMinutes;

    if (duration % 30 !== 0) {
      throw new BadRequestException(
        'Availability duration must be divisible by 30 minutes',
      );
    }
    // Fetch or create weekday slot
    const dateSlot = await getSlotOrCreateSlot(
      this.prisma,
      weekday,
      user.role,
      profile.id,
    );

    // Fetch existing time slots for the same weekday
    const existingSlots =
      await this.prisma.availableSlotsTimeForMeeting.findMany({
        where: {
          dateId: dateSlot.id,
          availabe: true,
          isBooked: false,
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });
    console.log("inputs", startTime, endTime, "\n existing slot", existingSlots)
    // Resolve overlap
    const result = resolveAvailabilityOverlap(
      { startTime, endTime },
      existingSlots,
    );

    console.log("result", result)
    if (result === 0) {
      throw new BadRequestException(
        'Availability fully overlaps an existing slot',
      );
    }

    if (result === 1) {
      throw new BadRequestException(
        'Availability partially overlaps an existing slot',
      );
    }

    const startDateTime = new Date(`1970-01-01T${result.startTime}:00Z`);
    const endDateTime = new Date(`1970-01-01T${result.endTime}:00Z`);

    if (startDateTime >= endDateTime) {
      throw new BadRequestException('Invalid availability after adjustment');
    }

    const timings =
      await this.prisma.availableSlotsTimeForMeeting.create({
        data: {
          dateId: dateSlot.id,
          startTime: startDateTime,
          endTime: endDateTime,
          availabe: true,
          isBooked: false,
        },
      });

    return {
      message: 'Slots created successfully',
      data: {
        weekday: dateSlot.weekday,
        ownerRole: user.role,
        timeslot: {
          startTime: timings.startTime,
          endTime: timings.endTime,
          available: timings.availabe,
          is_booked: timings.isBooked,
        },
      },
    };
  }


  async getMyAvailabilities(userId: string) {
    // 1. Fetch user role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Resolve profileId based on role
    const whereClause: any = {};

    if (user.role === Role.DOULA) {
      const doulaProfile = await this.prisma.doulaProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!doulaProfile) {
        throw new NotFoundException('Doula profile not found');
      }

      whereClause.doulaId = doulaProfile.id;
    } else if (user.role === Role.ZONE_MANAGER) {
      const zoneManagerProfile =
        await this.prisma.zoneManagerProfile.findUnique({
          where: { userId },
          select: { id: true },
        });

      if (!zoneManagerProfile) {
        throw new NotFoundException('Zone Manager profile not found');
      }

      whereClause.zoneManagerId = zoneManagerProfile.id;
    } else {
      throw new ForbiddenException('This role has no availability');
    }

    // 3. Fetch availability with time slots
    const availabilities = await this.prisma.availableSlotsForMeeting.findMany({
      where: whereClause,
      orderBy: { weekday: 'asc' },
      include: {
        AvailableSlotsTimeForMeeting: {
          orderBy: { startTime: 'asc' },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            availabe: true,
            isBooked: true,
          },
        },
      },
    });

    return availabilities;
  }

  //continue from here. booked or unbooked filter not needed on slots.
  //get all Slots of Zone Manager. Region Id is passsing for the convnience of user.
  async getAllSlots(
    regionId: string,
    startDate: string,
    endDate: string,
    filter: 'all' | 'booked' | 'unbooked' = 'all',
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const firstDate = new Date(startDate);
    const secondDate = new Date(endDate);
    secondDate.setDate(secondDate.getDate() + 1);

    // Validate region
    await findRegionOrThrow(this.prisma, regionId);

    // Find zone manager
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
      include: { zoneManager: true },
    });

    const manager = region?.zoneManagerId;
    // Base date filter
    const where: any = {
      zoneManagerId: manager,
      date: {
        gte: firstDate,
        lt: secondDate,
      },
    };

    // Build time filter inside include
    const timeFilter: any = {};
    if (filter === 'booked') timeFilter.isBooked = true;
    if (filter === 'unbooked') timeFilter.isBooked = false;

    const result = await paginate({
      prismaModel: this.prisma.availableSlotsForMeeting,
      page,
      limit,
      where,
      include: {
        AvailableSlotsTimeForMeeting: {
          where: filter === 'all' ? undefined : timeFilter,
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });

    const mapped = result.data.map((slot) => ({
      dateId: slot.id,
      weekday: slot.weekday,
      availabe: slot.availabe,
      ownerRole: slot.ownerRole,
      adminId: slot.adminId,
      doulaId: slot.doulaId,
      zoneManagerId: slot.zoneManagerId,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,

      timings:
        (slot as any).AvailableSlotsTimeForMeeting?.map((t: any) => ({
          timeId: t.id,
          startTime: t.startTime,
          endTime: t.endTime,
          availabe: t.availabe,
          isBooked: t.isBooked,
        })) || [],
    }));

    // ---- Return with mapped data ----
    return {
      data: mapped,
      meta: result.meta,
    };
  }

  async getSlotById(id: string) {
    const slot = await this.prisma.availableSlotsForMeeting.findUnique({
      where: { id },
      include: {
        AvailableSlotsTimeForMeeting: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    return {
      message: 'Slot retrieved successfully',
      slot,
    };
  }

  async updateSlotTimeById(dto: UpdateSlotsForMeetingTimeDto, userId: string) {
    const role = await findUserRoleById(this.prisma, userId);

    // Get the timeslot first
    const timeSlot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
      where: { id: dto.timeSlotId },
      include: {
        date: true, // to access the parent slot details
      },
    });

    if (!timeSlot) throw new NotFoundException('Time slot not found');

    const parentSlot = timeSlot.date; // AvailableSlotsForMeeting record

    // 🛡 permission check — ensure user owns this slot
    if (role === Role.ZONE_MANAGER) {
      const profile = await this.prisma.zoneManagerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (profile?.id !== parentSlot.zoneManagerId)
        throw new ForbiddenException(
          "You cannot update another Zone Manager's slot",
        );
    }

    if (role === Role.DOULA) {
      const profile = await this.prisma.doulaProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (profile?.id !== parentSlot.doulaId)
        throw new ForbiddenException("You cannot update another Doula's slot");
    }

    // ADMIN always allowed
    if (
      role !== Role.ADMIN &&
      role !== Role.ZONE_MANAGER &&
      role !== Role.DOULA
    ) {
      throw new BadRequestException('Authorization Failed');
    }

    const startDateTime = new Date(`${'1970-01-01'}T${dto.startTime}:00`);
    const endDateTime = new Date(`${'1970-01-01'}T${dto.endTime}:00`);
    // 🚀 Update time slot
    const updatedTimeSlot =
      await this.prisma.availableSlotsTimeForMeeting.update({
        where: { id: dto.timeSlotId },
        data: {
          startTime: startDateTime,
          endTime: endDateTime,
        },
      });

    return {
      message: 'Time slot updated successfully',
      data: updatedTimeSlot,
    };
  }

  async deleteSlots(slotId: string, userId: string) {
    // Get role of the user
    const role = await findUserRoleById(this.prisma, userId);

    // Get slot
    const slot = await this.prisma.availableSlotsForMeeting.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException('Slot Not Found');
    }

    // ADMIN can delete anyone's slot
    if (role === Role.ADMIN) {
      await this.prisma.availableSlotsForMeeting.delete({
        where: { id: slotId },
      });
      return {
        message: 'Slot Deleted Successfully',
        status: HttpStatus.NO_CONTENT,
      };
    }

    // ZONE MANAGER allowed only if slot belongs to them
    if (role === Role.ZONE_MANAGER) {
      const manager = await this.prisma.zoneManagerProfile.findUnique({
        where: { userId },
      });

      if (slot.zoneManagerId !== manager?.id) {
        throw new ForbiddenException('You are not allowed to delete this slot');
      }
      await this.prisma.availableSlotsTimeForMeeting.deleteMany({
        where: { dateId: slotId },
      });

      await this.prisma.availableSlotsForMeeting.delete({
        where: { id: slotId },
      });
      return { message: 'Slot Deleted Successfully' };
    }

    // DOULA allowed only if slot belongs to them
    if (role === Role.DOULA) {
      const doula = await this.prisma.doulaProfile.findUnique({
        where: { userId },
      });

      if (slot.doulaId !== doula?.id) {
        throw new ForbiddenException('You are not allowed to delete this slot');
      }

      await this.prisma.availableSlotsTimeForMeeting.deleteMany({
        where: { dateId: slotId },
      });

      await this.prisma.availableSlotsForMeeting.delete({
        where: { id: slotId },
      });
      return { message: 'Slot Deleted Successfully' };
    }

    throw new BadRequestException('Authorization failed');
  }

  async updateTimeSlotAvailability(
    id: string,
    booked: boolean,
    availabe: boolean,
  ) {
    const slot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
      where: { id: id },
    });
    if (!slot) {
      throw new NotFoundException('Slot Not Found');
    }
    await this.prisma.availableSlotsTimeForMeeting.update({
      where: { id: id },
      data: {
        isBooked: false,
        availabe: true,
      },
    });
    return { message: 'Slot Updated Successfully' };
  }

  async findall(
    user: any,
    startDate: string,
    endDate: string,
    filter: 'all' | 'booked' | 'unbooked' = 'all',
    page: number = 1,
    limit: number = 10,
  ) {
    let profile: any;
    let ownerField: 'zoneManagerId' | 'doulaId' | 'adminId';

    switch (user.role) {
      case Role.ZONE_MANAGER:
        profile = await this.prisma.zoneManagerProfile.findUnique({
          where: { userId: user.id },
        });
        ownerField = 'zoneManagerId';
        break;

      case Role.DOULA:
        profile = await this.prisma.doulaProfile.findUnique({
          where: { userId: user.id },
        });
        ownerField = 'doulaId';
        break;

      case Role.ADMIN:
        profile = await this.prisma.adminProfile.findUnique({
          where: { userId: user.id },
        });
        ownerField = 'adminId';
        break;

      default:
        throw new ForbiddenException('Invalid user role');
    }

    if (!profile) {
      throw new ForbiddenException('Profile not found for this user');
    }

    const skip = (page - 1) * limit;

    const firstDate = new Date(startDate);
    const secondDate = new Date(endDate);
    // make end exclusive by adding 1 day
    secondDate.setDate(secondDate.getDate() + 1);

    const where: any = {
      [ownerField]: profile.id, // dynamically use zoneManagerId/doulaId/adminId
      date: {
        gte: firstDate,
        lt: secondDate,
      },
    };

    // Build time filter inside include
    const timeFilter: any = {};
    if (filter === 'booked') timeFilter.isBooked = true;
    if (filter === 'unbooked') timeFilter.isBooked = false;

    const result = await paginate({
      prismaModel: this.prisma.availableSlotsForMeeting,
      page,
      limit,
      where,
      include: {
        AvailableSlotsTimeForMeeting: {
          where: filter === 'all' ? undefined : timeFilter,
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });

    // >>> transform rows here
    // ---- Map data ----
    const mapped = result.data.map((slot) => ({
      dateId: slot.id,
      weekday: slot.weekday,
      availabe: slot.availabe,
      ownerRole: slot.ownerRole,
      adminId: slot.adminId,
      doulaId: slot.doulaId,
      zoneManagerId: slot.zoneManagerId,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,

      timings:
        (slot as any).AvailableSlotsTimeForMeeting?.map((t: any) => ({
          timeId: t.id,
          startTime: t.startTime,
          endTime: t.endTime,
          availabe: t.availabe,
          isBooked: t.isBooked,
        })) || [],
    }));

    // ---- Return with mapped data ----
    return {
      data: mapped,
      meta: result.meta,
    };
  }

  async markOffDays(user: any, dto: MarkOffDaysDto) {
    const FULL_DAY_START = new Date('1970-01-01T00:00:00');
    const FULL_DAY_END = new Date('1970-01-01T23:59:59');

    const { startDate, endDate, startTime, endTime } = dto;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    start.setUTCHours(0, 0, 0, 0);
    end?.setUTCHours(0, 0, 0, 0);

    const zm = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!zm) {
      throw new NotFoundException('Zone Manager not found');
    }

    /**
     * CASE 1 & 2 — FULL DAY OFF
     * startTime & endTime NOT provided
     */
    if (!startTime && !endTime) {
      // Single day
      if (!end) {
        return this.prisma.offDays.create({
          data: {
            date: start,
            startTime: null,
            endTime: null,
            zoneManagerProfileId: zm.id,
          },
        });
      }

      // Multi-day range
      const offDays: Prisma.OffDaysCreateManyInput[] = [];
      const current = new Date(start);

      while (current <= end) {
        offDays.push({
          date: new Date(current),
          startTime: null,
          endTime: null,
          zoneManagerProfileId: zm.id,
        });

        current.setDate(current.getDate() + 1);
      }

      return this.prisma.offDays.createMany({ data: offDays });
    }

    /**
     * CASE 3 — PARTIAL DAY OFF
     */
    if (!startTime || !endTime) {
      throw new BadRequestException(
        'Both startTime and endTime are required for partial off days',
      );
    }

    const startMinutes = this.toMinutes(startTime);
    const endMinutes = this.toMinutes(endTime);

    if (endMinutes <= startMinutes) {
      throw new BadRequestException(
        'End time must be greater than start time',
      );
    }

    if ((endMinutes - startMinutes) % 30 !== 0) {
      throw new BadRequestException(
        'Duration must be divisible by 30 minutes',
      );
    }

    const startTimeObj = new Date(`1970-01-01T${startTime}:00`);
    const endTimeObj = new Date(`1970-01-01T${endTime}:00`);

    // Partial — single day
    if (!end) {
      return this.prisma.offDays.create({
        data: {
          date: start,
          startTime: startTimeObj,
          endTime: endTimeObj,
          zoneManagerProfileId: zm.id,
        },
      });
    }

    // Partial — multi-day
    const offDays: Prisma.OffDaysCreateManyInput[] = [];
    const current = new Date(start);

    while (current <= end) {
      offDays.push({
        date: new Date(current),
        startTime: startTimeObj,
        endTime: endTimeObj,
        zoneManagerProfileId: zm.id,
      });

      current.setDate(current.getDate() + 1);
    }

    return this.prisma.offDays.createMany({ data: offDays });
  }




  //debug purpose only
  async fetchOffdays(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const offdays = await this.prisma.offDays.findMany({
      where: {
        date: { gte: today },
        OR: [
          { DoulaProfile: { userId: userId } },
          { ZoneManagerProfile: { userId: userId } }
        ]
      },
      orderBy: {
        date: "asc"
      }
    })
    return offdays
  }

  async fetchOffdaysbyid(userId: string, id: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const offdays = await this.prisma.offDays.findFirst({
      where: {
        id: id,
        OR: [
          { DoulaProfile: { userId: userId } },
          { ZoneManagerProfile: { userId: userId } }
        ]
      },
      orderBy: {
        date: "asc"
      }
    })
    return offdays
  }



  async DeleteOffdaysbyid(userId: string, id: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const offdays = await this.prisma.offDays.delete({
      where: {
        id: id,
        OR: [
          { DoulaProfile: { userId: userId } },
          { ZoneManagerProfile: { userId: userId } }
        ]
      },
    })
    return { message: "Off days Deleted Successfully", data: offdays }
  }




  private getWeekdayEnum(date: Date): WeekDays {
    const day = date.getUTCDay(); // 👈 IMPORTANT
    return [
      WeekDays.SUNDAY,
      WeekDays.MONDAY,
      WeekDays.TUESDAY,
      WeekDays.WEDNESDAY,
      WeekDays.THURSDAY,
      WeekDays.FRIDAY,
      WeekDays.SATURDAY,
    ][day];
  }

  private isOverlapping(
    startA: Date,
    endA: Date,
    startB?: Date,
    endB?: Date,
  ): boolean {
    if (!startB || !endB) return true;
    return startA < endB && endA > startB;
  }

  private formatTimeOnly(date: Date): string {
    return date.toISOString().substring(11, 19)
  }

  private subtractIntervals(
    baseSlots: TimeSlot[],
    blockers: TimeSlot[],
  ): TimeSlot[] {
    let result = [...baseSlots];

    for (const block of blockers) {
      const temp: TimeSlot[] = [];

      for (const slot of result) {
        // No overlap
        if (
          block.endTime <= slot.startTime ||
          block.startTime >= slot.endTime
        ) {
          temp.push(slot);
          continue;
        }

        // Left remainder
        if (block.startTime > slot.startTime) {
          temp.push({
            startTime: slot.startTime,
            endTime: block.startTime,
          });
        }

        // Right remainder
        if (block.endTime < slot.endTime) {
          temp.push({
            startTime: block.endTime,
            endTime: slot.endTime,
          });
        }
      }

      result = temp;
    }

    return result;
  }

  // Treat dates as DATE-ONLY (UTC-safe)
  private toDateKey(d: Date): string {
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
  }

  // Align time-only values to the actual calendar date
  private normalizeToBaseDate(
    time: Date,
    baseDate: Date,
  ): Date {
    const d = new Date(baseDate);
    d.setHours(
      time.getHours(),
      time.getMinutes(),
      0,
      0,
    );
    return d;
  }


  async ZmgetAvailablility(
    regionId: string,
    dto: GetAvailabilityDto
  ) {
    const { date1, date2, weekday } = dto;

    /* ---------------- VALIDATION ---------------- */

    if (!date1) {
      throw new BadRequestException('date1 is required');
    }

    if (weekday && !date2) {
      throw new BadRequestException(
        'date2 is required when weekday filter is used',
      );
    }
    const startDate = new Date(date1);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = date2 ? new Date(date2) : new Date(startDate);
    endDate.setUTCHours(0, 0, 0, 0);


    if (startDate > endDate) {
      throw new BadRequestException('date1 cannot be after date2');
    }

    /* ---------------- FETCH ZONE MANAGER ---------------- */
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
      select: { id: true, zoneManagerId: true },
    });

    if (!region) {
      throw new ForbiddenException('Region not found');
    }
    if (!region.zoneManagerId) {
      throw new BadRequestException("Region Not Assigned to zone manager")
    }

    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { id: region.zoneManagerId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    /* ---------------- BUILD DATE LIST ---------------- */

    const dates: Date[] = [];
    let cursor = new Date(startDate);

    while (cursor.getTime() <= endDate.getTime()) {
      dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    /* ---------------- FILTER BY WEEKDAY IF PROVIDED ---------------- */

    const filteredDates = weekday
      ? dates.filter(
        (d) => this.getWeekdayEnum(d) === weekday,
      )
      : dates;

    /* ---------------- FETCH ALL DATA IN BULK ---------------- */

    const weekdays = [
      ...new Set(filteredDates.map((d) => this.getWeekdayEnum(d))),
    ];

    const weeklySlots = await this.prisma.availableSlotsForMeeting.findMany({
      where: {
        zoneManagerId: zoneManager.id,
        weekday: { in: weekdays },
        availabe: true,
      },
      include: {
        AvailableSlotsTimeForMeeting: {
          where: {
            availabe: true,
            isBooked: false,
          },
        },
      },
    });

    const meetings = await this.prisma.meetings.findMany({
      where: {
        zoneManagerProfileId: zoneManager.id,
        date: {
          in: filteredDates,
        },
      },
    });

    const offDays = await this.prisma.offDays.findMany({
      where: {
        zoneManagerProfileId: zoneManager.id,
        date: {
          in: filteredDates,
        },
      },
    });

    const response = filteredDates.map((date) => {
      const weekdayEnum = this.getWeekdayEnum(date);

      const weeklySlot = weeklySlots.find(
        (s) => s.weekday === weekdayEnum,
      );

      if (!weeklySlot) {
        return {
          date,
          weekday: weekdayEnum,
          timeslots: [],
        };
      }

      // 1️⃣ Base availability from AvailableSlotsTimeForMeeting
      let slots: TimeSlot[] =
        weeklySlot.AvailableSlotsTimeForMeeting.map((t) => ({
          startTime: this.normalizeToBaseDate(t.startTime, date),
          endTime: this.normalizeToBaseDate(t.endTime, date),
        }));



      // 2️⃣ Meetings as blockers
      const dayMeetings = meetings
        .filter(
          (m) => this.toDateKey(m.date) === this.toDateKey(date),
        )
        .map((m) => ({
          startTime: this.normalizeToBaseDate(m.startTime, date),
          endTime: this.normalizeToBaseDate(m.endTime, date),
        }));


      slots = this.subtractIntervals(slots, dayMeetings);

      // 3️⃣ Off-days as blockers
      const dayOffs = offDays.filter(
        (o) => this.toDateKey(o.date) === this.toDateKey(date),
      );


      for (const off of dayOffs) {
        // Full day off
        if (!off.startTime && !off.endTime) {
          slots = [];
          break;
        }

        slots = this.subtractIntervals(slots, [
          {
            startTime: this.normalizeToBaseDate(off.startTime!, date),
            endTime: this.normalizeToBaseDate(off.endTime!, date),

          },
        ]);
      }

      // 4️⃣ Format response
      return {
        date,
        weekday: weekdayEnum,
        timeslots: slots.map((s) => ({
          startTime: this.formatTimeOnly(s.startTime),
          endTime: this.formatTimeOnly(s.endTime),
        })),
      };
    });

    return response;

  }




  async splitTimeslots(
    regionId: string,
    dto: GetAvailabilityDto,
  ) {
    const baseResponse = await this.ZmgetAvailablility(regionId, dto);

    const response = baseResponse.map((day) => {
      const baseDate = new Date(day.date);

      const splitSlots = day.timeslots.flatMap((slot) => {
        const start = new Date(
          `${day.date.toISOString().split('T')[0]}T${slot.startTime}Z`,
        );
        const end = new Date(
          `${day.date.toISOString().split('T')[0]}T${slot.endTime}Z`,
        );

        return this.splitInto30MinSlots(
          { startTime: start, endTime: end },
          baseDate,
        );
      });

      return {
        date: day.date,
        weekday: day.weekday,
        timeslots: splitSlots.map((s) => ({
          startTime: this.formatTimeOnly(s.startTime),
          endTime: this.formatTimeOnly(s.endTime),
        })),
      };
    });

    return {
      status: 'success',
      message: 'Request successful',
      data: response,
    };
  }

}