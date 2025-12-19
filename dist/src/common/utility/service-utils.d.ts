import { Role, WeekDays } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
export declare function findSlotOrThrow(prisma: PrismaService, params: {
    ownerRole: Role;
    ownerProfileId: string;
    weekday: WeekDays;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    zoneManagerId: string | null;
    weekday: import("@prisma/client").$Enums.WeekDays;
    availabe: boolean;
    ownerRole: import("@prisma/client").$Enums.Role;
    doulaId: string | null;
    adminId: string | null;
}>;
export declare function findRegionOrThrow(prisma: PrismaService, regionId: string): Promise<{
    id: string;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
    pincode: string;
    regionName: string;
    district: string;
    state: string;
    country: string;
    latitude: string;
    longitude: string;
    zoneManagerId: string | null;
}>;
export declare function findZoneManagerOrThrowWithId(prisma: PrismaService, zoneManagerId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    profile_image: string | null;
    userId: string | null;
}>;
export declare function findDoulaOrThrowWithId(prisma: PrismaService, profileId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    regionId: string | null;
    description: string | null;
    achievements: string | null;
    qualification: string | null;
    yoe: number | null;
    languages: import("@prisma/client/runtime/library").JsonValue | null;
}>;
export declare function checkUserExistorNot(prisma: PrismaService, email: string): Promise<null>;
export declare function findUserOrThrowwithId(prisma: PrismaService, userId: string): Promise<{
    id: string;
    email: string;
    phone: string | null;
    name: string;
    otp: string | null;
    otpExpiresAt: Date | null;
    role: import("@prisma/client").$Enums.Role;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function findServiceOrThrowwithId(prisma: PrismaService, serviceId: string): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
}>;
export declare function findUserRoleById(prisma: PrismaService, userId: string): Promise<import("@prisma/client").$Enums.Role>;
export declare function findUserProfileId(prisma: PrismaService, userId: string): Promise<any>;
export declare function getSlotOrCreateSlot(prisma: PrismaService, week: WeekDays, userRole: Role, profileId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    zoneManagerId: string | null;
    weekday: import("@prisma/client").$Enums.WeekDays;
    availabe: boolean;
    ownerRole: import("@prisma/client").$Enums.Role;
    doulaId: string | null;
    adminId: string | null;
}>;
export declare function createTimeForSlot(prisma: PrismaService, slotId: string, startTime: Date, endTime: Date): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    availabe: boolean;
    startTime: Date;
    endTime: Date;
    isBooked: boolean;
    dateId: string;
    meetingsId: string | null;
}>;
export declare function toUTCDate(dateString: string): Date;
export declare function getOrcreateClent(prisma: PrismaService, data: any): Promise<any>;
export declare function getWeekdayFromDate(date: string | Date): WeekDays;
export declare function getServiceSlotOrCreateSlot(prisma: PrismaService, weekday: WeekDays, profileId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weekday: import("@prisma/client").$Enums.WeekDays;
    availabe: boolean;
    doulaId: string;
    isBooked: boolean;
}>;
export declare function parseTimeSlot(timeSlot: string): {
    startTime: Date;
    endTime: Date;
};
export declare function isMeetingExists(prisma: PrismaService, meetingDate: Date, timeSlot: string, options?: {
    zoneManagerProfileId?: string;
    doulaProfileId?: string;
    adminProfileId?: string;
}): Promise<boolean>;
export declare function isOverlapping(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): Promise<boolean>;
export declare function generateVisitDates(start: Date, end: Date, frequency: number, buffer?: number): Promise<Date[]>;
