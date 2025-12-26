import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MeetingStatus, Role, WeekDays } from '@prisma/client';
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

export async function getServiceSlotOrCreateSlot(
  prisma: PrismaService,
  weekday: WeekDays,
  profileId: string,
) {
  // FORCE UTC MIDNIGHT MATCH FOR MYSQL @db.Date
  // const formatted = dateString.split("T")[0];
  // const slotDate = new Date(formatted + "T00:00:00.000Z");

  // const weekday = slotDate.toLocaleDateString("en-US", { weekday: "long" });
  // 1. Try existing slot
  let slot = await prisma.availableSlotsForService.findUnique({
    where: {
      doulaId_weekday: {
        doulaId: profileId,
        weekday: weekday,
      },
    },
  });

  if (slot) return slot;

  // 2. Create new slot
  slot = await prisma.availableSlotsForService.create({
    data: {
      weekday: weekday,
      availabe: true,
      doulaId: profileId,
    },
  });

  return slot;
}

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

export async function generateVisitDates(
  start: Date,
  end: Date,
  frequency: number,
  buffer = 0,
): Promise<Date[]> {
  const dates: Date[] = [];
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() - buffer);

  const final = new Date(end);
  final.setDate(final.getDate() + buffer);

  while (cursor <= final) {
    const d = new Date(cursor);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
    cursor.setDate(cursor.getDate() + frequency);
  }

  return dates;
}



