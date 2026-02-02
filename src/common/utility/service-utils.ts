import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MeetingStatus, Role, TimeShift, WeekDays } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
// utils/meeting.util.ts

export async function findSlotOrThrow(
  prisma: PrismaService,
  params: {
    ownerRole: Role;
    ownerProfileId: string;
    weekday: WeekDays;
  },
) {
  const { ownerRole, ownerProfileId, weekday } = params;

  console.log('ownerRole', ownerRole);
  console.log('ownerProfileId', ownerProfileId);
  console.log('weekday', weekday);

  const where: any = {};

  if (ownerRole === Role.DOULA) {
    where.doulaId_weekday = {
      doulaId: ownerProfileId,
      weekday,
    };
  }

  if (ownerRole === Role.ZONE_MANAGER) {
    where.zoneManagerId_weekday = {
      zoneManagerId: ownerProfileId,
      weekday,
    };
  }

  const slot = await prisma.availableSlotsForMeeting.findUnique({
    where,
  });

  console.log('slot', slot);

  if (!slot) {
    throw new NotFoundException('Slot Not Found');
  }

  return slot;
}

export async function findRegionOrThrow(
  prisma: PrismaService,
  regionId: string,
) {
  const region = await prisma.region.findUnique({
    where: { id: regionId },
  });

  if (!region) {
    throw new NotFoundException('Slot Not Found');
  }

  return region;
}

export async function findZoneManagerOrThrowWithId(
  prisma: PrismaService,
  zoneManagerId: string,
) {
  const zoneManager = await prisma.zoneManagerProfile.findUnique({
    where: { id: zoneManagerId },
  });

  if (!zoneManager) {
    throw new NotFoundException('Zone Manager Profile Not Found');
  }

  return zoneManager;
}

export async function findDoulaOrThrowWithId(
  prisma: PrismaService,
  profileId: string,
) {
  const doula = await prisma.doulaProfile.findUnique({
    where: { id: profileId },
  });

  if (!doula) {
    throw new NotFoundException('Doula Not Found');
  }

  return doula;
}

export async function checkUserExistorNot(
  prisma: PrismaService,
  email: string,
) {
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    throw new BadRequestException('User with this email already exists');
  }
  return existingUser;
}

export async function findUserOrThrowwithId(
  prisma: PrismaService,
  userId: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User Not Found');
  }

  return user;
}

export async function findServiceOrThrowwithId(
  prisma: PrismaService,
  serviceId: string,
) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new NotFoundException('Service Not Found');
  }

  return service;
}

export async function findUserRoleById(prisma: PrismaService, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new NotFoundException('User Not found');
  }
  return user?.role;
}

export async function findUserProfileId(prisma: PrismaService, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new NotFoundException('User Not found');
  }
  return user?.role;

  let id;

  if (user?.role === Role.ZONE_MANAGER) {
    id = await prisma.zoneManagerProfile.findUnique({
      where: { userId },
    });
  } else if (user?.role === Role.DOULA) {
    id = await prisma.doulaProfile.findUnique({
      where: { userId },
    });
  } else if (user?.role === Role.ADMIN) {
    id = await prisma.adminProfile.findUnique({
      where: { userId },
    });
  }

  return id;
}
export async function getSlotOrCreateSlot(
  prisma: PrismaService,
  week: WeekDays,
  userRole: Role,
  profileId: string,
) {
  // FORCE UTC MIDNIGHT MATCH FOR MYSQL @db.Date
  // const formatted = dateString.split("T")[0];
  // const slotDate = new Date(formatted + "T00:00:00.000Z");

  // const weekday = slotDate.toLocaleDateString("en-US", { weekday: "long" });

  const uniqueWhere =
    userRole === Role.DOULA
      ? { doulaId_weekday: { doulaId: profileId, weekday: week } }
      : userRole === Role.ADMIN
        ? { adminId_weekday: { adminId: profileId, weekday: week } }
        : {
          zoneManagerId_weekday: { zoneManagerId: profileId, weekday: week },
        };
  console.log('unique where', uniqueWhere);
  const ownerField =
    userRole === Role.DOULA
      ? 'doulaId'
      : userRole === Role.ADMIN
        ? 'adminId'
        : 'zoneManagerId';

  // 1. Try existing slot
  let slot = await prisma.availableSlotsForMeeting.findUnique({
    where: uniqueWhere,
  });

  if (slot) return slot;

  // 2. Create new slot
  slot = await prisma.availableSlotsForMeeting.create({
    data: {
      weekday: week,
      ownerRole: userRole,
      availabe: true,
      [ownerField]: profileId,
    },
  });

  return slot;
}

export async function createTimeForSlot(
  prisma: PrismaService,
  slotId: string,
  startTime: Date,
  endTime: Date,
) {
  return prisma.availableSlotsTimeForMeeting.create({
    data: {
      dateId: slotId,
      startTime,
      endTime,
      availabe: true,
      isBooked: false,
    },
  });
}

export function toUTCDate(dateString: string) {
  const d = new Date(dateString);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

export async function getOrcreateClent(prisma: PrismaService, data: any) {
  // 1. Try existing slot
  let user;
  console.log('data', data);
  user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      clientProfile: true,
    },
  });

  if (user) return user;
  //client is created while submiting the enquiry form. might be useful for followup
  user = prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: Role.CLIENT,
      clientProfile: { create: { is_verified: true } },
    },
    include: {
      clientProfile: true,
    },
  });
  return user;
}

export function getWeekdayFromDate(date: string | Date): WeekDays {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }

  const map: WeekDays[] = [
    WeekDays.SUNDAY,
    WeekDays.MONDAY,
    WeekDays.TUESDAY,
    WeekDays.WEDNESDAY,
    WeekDays.THURSDAY,
    WeekDays.FRIDAY,
    WeekDays.SATURDAY,
  ];

  return map[d.getDay()];
}

// export async function getServiceSlotOrCreateSlot(
//   prisma: PrismaService,
//   weekday: WeekDays,
//   profileId: string,
// ) {
//   // FORCE UTC MIDNIGHT MATCH FOR MYSQL @db.Date
//   // const formatted = dateString.split("T")[0];
//   // const slotDate = new Date(formatted + "T00:00:00.000Z");

//   // const weekday = slotDate.toLocaleDateString("en-US", { weekday: "long" });
//   // 1. Try existing slot
//   let slot = await prisma.availableSlotsForService.findUnique({
//     where: {
//       doulaId_weekday: {
//         doulaId: profileId,
//         weekday: weekday,
//       },
//     },
//   });

//   if (slot) return slot;

//   // 2. Create new slot
//   slot = await prisma.availableSlotsForService.create({
//     data: {
//       weekday: weekday,
//       // availabe: true,
//       doulaId: profileId,
//     },
//   });

//   return slot;
// }

export function parseTimeSlot(timeSlot: string): {
  startTime: Date;
  endTime: Date;
} {
  const match = timeSlot.match(
    /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/,
  );

  if (!match) {
    throw new Error('Invalid time slot format. Expected HH:mm-HH:mm');
  }

  const [, sh, sm, eh, em] = match;

  const baseDate = '1970-01-01';

  return {
    startTime: new Date(`${baseDate}T${sh}:${sm}:00`),
    endTime: new Date(`${baseDate}T${eh}:${em}:00`),
  };
}

export async function isMeetingExists(
  prisma: PrismaService,
  meetingDate: Date,
  timeSlot: string,
  options?: {
    zoneManagerProfileId?: string;
    doulaProfileId?: string;
    adminProfileId?: string;
  },
): Promise<boolean> {
  const { startTime, endTime } = parseTimeSlot(timeSlot);

  const startOfDay = new Date(meetingDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(meetingDate);
  endOfDay.setHours(23, 59, 59, 999);

  const meeting = await prisma.meetings.findFirst({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },

      // OVERLAP CHECK:
      // existing.start < new.end AND existing.end > new.start
      AND: [
        {
          startTime: {
            lt: endTime,
          },
        },
        {
          endTime: {
            gt: startTime,
          },
        },
      ],

      ...(options?.zoneManagerProfileId && {
        zoneManagerProfileId: options.zoneManagerProfileId,
      }),
      ...(options?.doulaProfileId && {
        doulaProfileId: options.doulaProfileId,
      }),
      ...(options?.adminProfileId && {
        adminProfileId: options.adminProfileId,
      }),
    },
  });

  return Boolean(meeting);
}

export async function isOverlapping(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
) {
  return aStart < bEnd && bStart < aEnd;
}

export function generateVisitDatesforBirthDoula(
  start: Date,
  buffer = 0,
): Date[] {
  if (buffer < 0) {
    throw new Error('Buffer cannot be negative');
  }

  const dates: Date[] = [];

  // Start from (startDate - buffer)
  const cursor = new Date(start.getTime());
  cursor.setUTCDate(cursor.getUTCDate() - buffer);

  // End at (startDate + buffer)
  const final = new Date(start.getTime());
  final.setUTCDate(final.getUTCDate() + buffer);

  let guard = 0;

  while (cursor.getTime() <= final.getTime()) {
    dates.push(new Date(cursor.getTime()));

    // Move forward one day (UTC-safe)
    cursor.setUTCDate(cursor.getUTCDate() + 1);

    if (++guard > 400) {
      throw new Error(
        'Infinite loop protection triggered in generateVisitDatesforBirthDoula',
      );
    }
  }

  return dates;
}

type Weekday =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';

const WEEKDAY_MAP: Record<Weekday, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export async function generateVisitDatesforPostPartumDoula(
  startDate: Date,
  endDate?: Date,
  visitDays: Weekday[] = [],
): Promise<Date[]> {
  // ✅ Single-date case (unchanged behavior)
  if (!endDate || startDate.getTime() === endDate.getTime()) {
    return [new Date(startDate.getTime())];
  }

  const dates: Date[] = [];
  const requiredDays = new Set(visitDays.map(day => WEEKDAY_MAP[day]));

  let current = new Date(startDate.getTime());
  current.setHours(0, 0, 0, 0);

  const end = new Date(endDate.getTime());
  end.setHours(0, 0, 0, 0);

  while (current.getTime() <= end.getTime()) {
    if (requiredDays.has(current.getDay())) {
      dates.push(new Date(current.getTime()));
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}





import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Checks if a doula is available for a given date and time shift
 */
export async function isDoulaAvailableForShift(
  doulaId: string,
  date: Date,
  timeShift: TimeShift,
): Promise<boolean> {
  // Normalize date to avoid time issues
  const normalizedDate = new Date(date);
  console.log("normalised date")
  // normalizedDate.setHours(0, 0, 0, 0);

  const availabilityRecord =
    await prisma.availableSlotsForService.findFirst({
      where: {
        doulaId,
        date: normalizedDate,
      },
      select: {
        availability: true,
      },
    });

  if (!availabilityRecord) {
    return false;
  }

  const availability = availabilityRecord.availability as Record<
    TimeShift,
    boolean
  >;

  // FULLDAY overrides all
  if (availability.FULLDAY === true && availability.MORNING === true && availability.NIGHT === true) {
    return true;
  }

  return availability[timeShift] === true;
}




export function areWeekdaysPresentBetweenDates(
  startDate: Date,
  endDate: Date,
  weekdays: Weekday[],
): boolean {
  if (startDate > endDate) return false;

  const requiredDays = new Set(weekdays.map(day => WEEKDAY_MAP[day]));
  const foundDays = new Set<number>();

  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    const day = current.getDay();
    if (requiredDays.has(day)) {
      foundDays.add(day);
      if (foundDays.size === requiredDays.size) {
        return true; // early exit optimization
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return false;
}


/**
 * Returns TRUE if doula is OFF on the given date & time shift
 */
export async function isDoulaOffOnShift(
  doulaProfileId: string,
  date: Date,
  timeShift: TimeShift,
): Promise<boolean> {
  // Normalize date
  // Prevents mismatches like:
  // 2026-01-07 09:30
  // vs
  // 2026-01-07 00:00
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const offDayRecord = await prisma.doulaOffDays.findFirst({
    where: {
      doulaProfileId,
      date: normalizedDate,
    },
    select: {
      offtime: true,
    },
  });

  if (!offDayRecord) {
    return false;
  }

  const offtime = offDayRecord.offtime as Record<TimeShift, boolean>;

  // FULLDAY blocks everything
  if (offtime.FULLDAY === true) {
    return true;
  }

  return offtime[timeShift] === true;
}

export function formatTimeOnly(date: Date | string | null): string | null {
  if (!date) return null;

  const d = new Date(date);
  return d.toISOString().substring(11, 16); // HH:mm
}

export function daysBetween(start: Date, end: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const startUtc = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );

  const endUtc = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );

  return Math.floor((endUtc - startUtc) / MS_PER_DAY);
}


export function generateOrderId(): string {
  const now = new Date();
  const pad = (n: number, width: number) => {
    return n.toString().padStart(width, '0');
  };
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1, 2);
  const day = pad(now.getDate(), 2);
  const hour = pad(now.getHours(), 2);
  const minute = pad(now.getMinutes(), 2);
  const second = pad(now.getSeconds(), 2);
  const timestamp = `${year}${month}${day}${hour}${minute}${second}`;
  return `DOULAS${timestamp}`;
}

type ServicePrice = {
  morning: number;
  night: number;
  fullday: number;
};

export function getPriceForShift(
  price: unknown,
  shift: TimeShift,
): number {
  if (!price || typeof price !== 'object') {
    throw new BadRequestException('Invalid price configuration');
  }

  const p = price as ServicePrice;

  switch (shift) {
    case TimeShift.MORNING:
      return p.morning;
    case TimeShift.NIGHT:
      return p.night;
    case TimeShift.FULLDAY:
      return p.fullday;
    default:
      throw new BadRequestException('Invalid time shift');
  }



}
