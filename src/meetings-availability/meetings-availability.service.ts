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
@Injectable()
export class AvailableSlotsService {
  constructor(private prisma: PrismaService) { }

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
    // const user = findUserOrThrowwithId(this.prisma, userId)
    const { weekday, startTime, endTime } = dto;

    // const slotDate = new Date(date)
    // const weekday = format(slotDate, "EEEE");
    // console.log(weekday)

    const startDateTime = new Date(`${'1970-01-01'}T${startTime}:00`);
    const endDateTime = new Date(`${'1970-01-01'}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      throw new BadRequestException('Start time must be before end time.');
    }
    //create AvailableSlotsForMeeting instance first:
    const dateslot = await getSlotOrCreateSlot(
      this.prisma,
      weekday,
      user.role,
      profile.id,
    );

    //create AvailableSlotsTimeForMeeting for AvailableSlotsForMeeting.
    const timings = await this.prisma.availableSlotsTimeForMeeting.create({
      data: {
        dateId: dateslot.id,
        startTime: startDateTime,
        endTime: endDateTime,
        availabe: true,
        isBooked: false,
      },
    });
    console.log(dateslot);

    return {
      message: 'Slots created successfully',
      data: {
        weekday: dateslot.weekday,
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
    const { startDate, endDate, startTime, endTime } = dto;

    const startTimeObj = new Date(`1970-01-01T${startTime}:00`);
    const endTimeObj = new Date(`1970-01-01T${endTime}:00`);

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    // Normalize dates
    start.setHours(0, 0, 0, 0);
    end?.setHours(0, 0, 0, 0);

    if (user.role === Role.DOULA) {
      const doula = await this.prisma.doulaProfile.findUnique({
        where: { userId: user.id },
      });

      if (!doula) {
        throw new NotFoundException('Doula not found');
      }

      // SINGLE DAY
      if (!end) {
        return this.prisma.offDays.create({
          data: {
            date: start,
            startTime: startTimeObj,
            endTime: endTimeObj,
            doulaProfileId: doula.id,
          },
        });
      }

      // MULTI-DAY RANGE
      const offDaysData: Prisma.OffDaysCreateManyInput[] = [];
      const current = new Date(start);

      while (current <= end) {
        offDaysData.push({
          date: new Date(current),
          startTime: startTimeObj,
          endTime: endTimeObj,
          doulaProfileId: doula.id,
        });

        current.setDate(current.getDate() + 1);
      }

      return this.prisma.offDays.createMany({
        data: offDaysData,
      });
    }

    // ZONE MANAGER
    if (user.role === Role.ZONE_MANAGER) {
      const zm = await this.prisma.zoneManagerProfile.findUnique({
        where: { userId: user.id },
      });

      if (!zm) {
        throw new NotFoundException('Zone Manager not found');
      }

      // SINGLE DAY
      if (!end) {
        return this.prisma.offDays.create({
          data: {
            date: start,
            startTime: startTimeObj,
            endTime: endTimeObj,
            doulaProfileId: zm.id,
          },
        });
      }

      // MULTI-DAY RANGE
      const offDaysData: Prisma.OffDaysCreateManyInput[] = [];
      const current = new Date(start);

      while (current <= end) {
        offDaysData.push({
          date: new Date(current),
          startTime: startTimeObj,
          endTime: endTimeObj,
          doulaProfileId: zm.id,
        });

        current.setDate(current.getDate() + 1);
      }

      return this.prisma.offDays.createMany({
        data: offDaysData,
      });
    }
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
    const map: WeekDays[] = [
      WeekDays.SUNDAY,
      WeekDays.MONDAY,
      WeekDays.TUESDAY,
      WeekDays.WEDNESDAY,
      WeekDays.THURSDAY,
      WeekDays.FRIDAY,
      WeekDays.SATURDAY,
    ];
    return map[date.getDay()];
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


  async ZmgetAvailablility(
    userId: string,
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
    const endDate = date2 ? new Date(date2) : startDate;

    if (startDate > endDate) {
      throw new BadRequestException('date1 cannot be after date2');
    }

    /* ---------------- FETCH ZONE MANAGER ---------------- */

    const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!zoneManager) {
      throw new ForbiddenException('Zone manager profile not found');
    }

    /* ---------------- BUILD DATE LIST ---------------- */

    const dates: Date[] = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(new Date(d));
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

    /* ---------------- CALCULATE AVAILABILITY ---------------- */

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

      let slots = weeklySlot.AvailableSlotsTimeForMeeting.map((t) => ({
        startTime: t.startTime,
        endTime: t.endTime,
      }));

      /* ----- REMOVE MEETINGS ----- */
      const dayMeetings = meetings.filter(
        (m) => m.date.toDateString() === date.toDateString(),
      );

      slots = slots.filter(
        (slot) =>
          !dayMeetings.some((m) =>
            this.isOverlapping(
              slot.startTime,
              slot.endTime,
              m.startTime,
              m.endTime,
            ),
          ),
      );

      /* ----- REMOVE OFF DAYS ----- */
      const dayOff = offDays.find(
        (o) => o.date.toDateString() === date.toDateString(),
      );

      if (dayOff) {
        // full-day off
        if (!dayOff.startTime && !dayOff.endTime) {
          slots = [];
        } else {
          slots = slots.filter(
            (slot) =>
              !this.isOverlapping(
                slot.startTime,
                slot.endTime,
                dayOff.startTime ?? undefined,
                dayOff.endTime ?? undefined,
              ),
          );
        }
      }

      return {
        date,
        weekday: weekdayEnum,
        timeslots: slots.map((slot) => ({
          startTime: this.formatTimeOnly(slot.startTime),
          endTime: this.formatTimeOnly(slot.endTime),
        }))

      };
    });
    return response;
  }

}