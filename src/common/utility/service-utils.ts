import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export async function findSlotOrThrow(
  prisma: PrismaService,
  slotId: string,
) {
  const slot = await prisma.availableSlotsTimeForMeeting.findUnique({
    where: { id: slotId },
  });

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



export async function findUserRoleById(
  prisma: PrismaService,
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  if (!user) {
    throw new NotFoundException("User Not found")
  }
  return user?.role
}

export async function findUserProfileId(
  prisma: PrismaService,
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  if (!user) {
    throw new NotFoundException("User Not found")
  }
  return user?.role

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
  dateString: string,
  userRole: Role,
  profileId: string
) {
  // FORCE UTC MIDNIGHT MATCH FOR MYSQL @db.Date
  const formatted = dateString.split("T")[0];
  const slotDate = new Date(formatted + "T00:00:00.000Z");

  const weekday = slotDate.toLocaleDateString("en-US", { weekday: "long" });

  const uniqueWhere =
    userRole === Role.DOULA
      ? { doulaId_date: { doulaId: profileId, date: slotDate } }
      : userRole === Role.ADMIN
        ? { adminId_date: { adminId: profileId, date: slotDate } }
        : { zoneManagerId_date: { zoneManagerId: profileId, date: slotDate } };

  const ownerField =
    userRole === Role.DOULA ? "doulaId" :
      userRole === Role.ADMIN ? "adminId" :
        "zoneManagerId";

  // 1. Try existing slot
  let slot = await prisma.availableSlotsForMeeting.findUnique({
    where: uniqueWhere,
  });

  if (slot) return slot;

  // 2. Create new slot
  slot = await prisma.availableSlotsForMeeting.create({
    data: {
      date: slotDate,
      weekday,
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
  endTime: Date
) {
  return prisma.availableSlotsTimeForMeeting.create({
    data: {
      dateId: slotId,
      startTime,
      endTime,
      availabe: true,
      isBooked: false
    }
  });
}

export function toUTCDate(dateString: string) {
  const d = new Date(dateString);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}


export async function getOrcreateClent(
  prisma: PrismaService,
  data: any) {

  // 1. Try existing slot
  let user;
  console.log("data", data)
  user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      clientProfile: true
    }
  });

  if (user) return user;
  //client is created while submiting the enquiry form. might be useful for followup
  user = prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: Role.CLIENT,
      clientProfile: { create: {} }
    },
    include: {
      clientProfile: true
    }
  })
  return user
}


export async function getServiceSlotOrCreateSlot(
  prisma: PrismaService,
  dateString: string,
  profileId: string
) {
  // FORCE UTC MIDNIGHT MATCH FOR MYSQL @db.Date
  const formatted = dateString.split("T")[0];
  const slotDate = new Date(formatted + "T00:00:00.000Z");

  const weekday = slotDate.toLocaleDateString("en-US", { weekday: "long" });
  // 1. Try existing slot
  let slot = await prisma.availableSlotsForService.findUnique({
    where: {
      doulaId_date: {
        doulaId: profileId,
        date: slotDate
      }
    },
  });

  if (slot) return slot;

  // 2. Create new slot
  slot = await prisma.availableSlotsForService.create({
    data: {
      date: slotDate,
      weekday,
      availabe: true,
      doulaId: profileId
    },
  });

  return slot;
}