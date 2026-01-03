import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AvailableDoulasFilterDto, CreateDoulaServiceAvailabilityDto, ServiceAvailabilityDto, UpdateDoulaServiceAvailabilityDto } from './dto/service-availability.dto';
import { Prisma, Role, ServiceStatus, TimeShift } from '@prisma/client';
import { CreateDoulaOffDaysDto, UpdateDoulaOffDaysDto } from './dto/off-days.dto';

type AvailableDoulaResult = {
  doulaName: string;
  shift: string[];
  noOfUnavailableDaysInThatPeriod: number;
  availableServices: string[];
};

@Injectable()
export class DoulaServiceAvailabilityService {
  constructor(private prisma: PrismaService) { }

  private async getDoulaProfile(userId: string) {
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId },
    });

    if (!doula) {
      throw new ForbiddenException('Doula profile not found');
    }

    return doula;
  }

  async createAvailability(
    dto: CreateDoulaServiceAvailabilityDto,
    user: any,
  ) {
    // 1. Fetch doula profile
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
    });

    if (!doula) {
      throw new ForbiddenException('Doula profile not found');
    }

    const { date1, date2, availability } = dto;

    /**
     * Convert availability to Prisma JSON
     */
    const toJsonAvailability = (): Prisma.InputJsonObject => ({
      MORNING: availability.MORNING,
      NIGHT: availability.NIGHT,
      FULLDAY: availability.FULLDAY,
    });

    /**
     * Normalize date to YYYY-MM-DD (UTC)
     */
    const normalizeDate = (date: string): Date =>
      new Date(`${date}T00:00:00.000Z`);

    const startDate = normalizeDate(date1);
    const endDate = date2 ? normalizeDate(date2) : startDate;

    if (startDate > endDate) {
      throw new BadRequestException('date1 cannot be after date2');
    }

    /**
     * Generate date range (inclusive)
     */
    const dates: Date[] = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    /**
     * Prepare records
     */
    const records = dates.map((date) => ({
      date,
      availability: toJsonAvailability(),
      doulaId: doula.id,
    }));

    /**
     * Create records (skip duplicates)
     * Requires unique constraint on (doulaId, date)
     */
    await this.prisma.availableSlotsForService.createMany({
      data: records,
      skipDuplicates: true,
    });

    return {
      message: 'Service availability saved successfully',
      data: {
        from: startDate,
        to: endDate,
        totalDays: records.length,
      },
    };
  }



  //continue from here. booked or unbooked filter not needed on slots.
  //get all Slots of Zone Manager. Region Id is passsing for the convnience of user.
  async findAll(
    user: any,
    query?: { fromDate?: string; toDate?: string },
  ) {
    const doula = await this.getDoulaProfile(user.id);

    const where: any = {
      doulaId: doula.id,
    };

    if (query?.fromDate || query?.toDate) {
      where.date = {
        ...(query.fromDate && {
          gte: new Date(`${query.fromDate}T00:00:00.000Z`),
        }),
        ...(query.toDate && {
          lte: new Date(`${query.toDate}T00:00:00.000Z`),
        }),
      };
    }

    const slots = await this.prisma.availableSlotsForService.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return {
      message: 'Service availability fetched successfully',
      data: slots,
    };
  }


  async findOne(id: string, user: any) {
    const doula = await this.getDoulaProfile(user.id);

    const slot = await this.prisma.availableSlotsForService.findFirst({
      where: {
        id,
        doulaId: doula.id,
      },
    });

    if (!slot) {
      throw new NotFoundException('Service availability not found');
    }

    return {
      message: 'Service availability fetched successfully',
      data: slot,
    };
  }


  async update(
    id: string,
    dto: UpdateDoulaServiceAvailabilityDto,
    user: any,
  ) {
    const doula = await this.getDoulaProfile(user.id);

    const slot = await this.prisma.availableSlotsForService.findFirst({
      where: {
        id,
        doulaId: doula.id,
      },
    });

    if (!slot) {
      throw new NotFoundException('Service availability not found');
    }

    const updatedAvailability = {
      ...(slot.availability as Record<string, boolean>),
      ...(dto.availability ?? {}),
    };

    const updated = await this.prisma.availableSlotsForService.update({
      where: { id },
      data: {
        availability: updatedAvailability,
      },
    });

    return {
      message: 'Service availability updated successfully',
      data: updated,
    };
  }


  async remove(id: string, user: any) {
    const doula = await this.getDoulaProfile(user.id);

    const slot = await this.prisma.availableSlotsForService.findFirst({
      where: {
        id,
        doulaId: doula.id,
      },
    });

    if (!slot) {
      throw new NotFoundException('Service availability not found');
    }

    await this.prisma.availableSlotsForService.delete({
      where: { id },
    });

    return {
      message: 'Service availability deleted successfully',
    };
  }

  async createOffDays(
    dto: CreateDoulaOffDaysDto,
    user: any,
  ) {
    // 1. Fetch doula profile
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
    });

    if (!doula) {
      throw new ForbiddenException('Doula profile not found');
    }

    const { date1, date2, offtime } = dto;

    const normalizeDate = (date: string): Date =>
      new Date(`${date}T00:00:00.000Z`);

    const startDate = normalizeDate(date1);
    const endDate = date2 ? normalizeDate(date2) : startDate;

    if (startDate > endDate) {
      throw new BadRequestException('date1 must be before or equal to date2');
    }

    /**
     * 2. Generate date range (inclusive)
     */
    const dates: Date[] = [];
    const cursor = new Date(startDate);

    while (cursor <= endDate) {
      dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    /**
     * 3. Fetch service availability for validation
     */
    const availabilities =
      await this.prisma.availableSlotsForService.findMany({
        where: {
          doulaId: doula.id,
          date: { in: dates },
        },
        select: {
          id: true,
          date: true,
          availability: true,
        },
      });

    const availabilityMap = new Map<string, any>();
    for (const a of availabilities) {
      availabilityMap.set(a.date.toISOString(), a);
    }

    /**
     * 4. Validate overlap
     */
    const invalidDates: string[] = [];

    for (const date of dates) {
      const record = availabilityMap.get(date.toISOString());

      if (!record) {
        invalidDates.push(date.toISOString().split('T')[0]);
        continue;
      }

      const availability = record.availability;

      const hasOverlap =
        (offtime.MORNING && availability.MORNING) ||
        (offtime.NIGHT && availability.NIGHT) ||
        (offtime.FULLDAY && availability.FULLDAY);

      if (!hasOverlap) {
        invalidDates.push(date.toISOString().split('T')[0]);
      }
    }

    if (invalidDates.length) {
      throw new BadRequestException({
        message:
          'Off days can only be marked on dates with active service availability',
        invalidDates,
      });
    }

    /**
     * 5. Remove already existing off-days
     */
    const existing = await this.prisma.doulaOffDays.findMany({
      where: {
        doulaProfileId: doula.id,
        date: { in: dates },
      },
      select: { date: true },
    });

    const existingSet = new Set(
      existing.map((d) => d.date.toISOString()),
    );

    const offtimeJson: Prisma.InputJsonValue = {
      MORNING: offtime.MORNING,
      NIGHT: offtime.NIGHT,
      FULLDAY: offtime.FULLDAY,
    };

    const recordsToCreate: Prisma.DoulaOffDaysCreateManyInput[] =
      dates
        .filter((d) => !existingSet.has(d.toISOString()))
        .map((date) => ({
          date,
          offtime: offtimeJson,
          doulaProfileId: doula.id,
        }));

    if (!recordsToCreate.length) {
      throw new BadRequestException(
        'Off days already exist for the selected date(s)',
      );
    }

    /**
     * 6. TRANSACTION:
     *    - Create off-days
     *    - Mark service availability as false
     */
    await this.prisma.$transaction(async (tx) => {
      // 6.1 Create off-days
      await tx.doulaOffDays.createMany({
        data: recordsToCreate,
      });

      // 6.2 Update service availability → force false
      for (const date of dates) {
        const record = availabilityMap.get(date.toISOString());
        if (!record) continue;

        await tx.availableSlotsForService.update({
          where: { id: record.id },
          data: {
            availability: {
              MORNING: false,
              NIGHT: false,
              FULLDAY: false,
            },
          },
        });
      }
    });

    return {
      message:
        'Off days created and service availability disabled successfully',
      data: {
        totalCreated: recordsToCreate.length,
        from: startDate,
        to: endDate,
        offtime,
      },
    };
  }



  async getOffDays(user: any) {
    // 1. Fetch doula profile
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
    });

    if (!doula) {
      throw new ForbiddenException('Doula profile not found');
    }

    // 2. Fetch off-days
    const offDays = await this.prisma.doulaOffDays.findMany({
      where: { doulaProfileId: doula.id },
      orderBy: { date: 'asc' },
    });

    return {
      message: 'Off days fetched successfully',
      data: offDays,
    };
  }

  /* ------------------------- GET BY ID ------------------------- */

  async getOffdaysbyId(id: string, user: any) {
    const doula = await this.getDoulaProfile(user.id);

    const offDay = await this.prisma.doulaOffDays.findFirst({
      where: {
        id,
        doulaProfileId: doula.id,
      },
    });

    if (!offDay) {
      throw new NotFoundException('Off day not found');
    }

    return {
      message: 'Off day fetched successfully',
      data: offDay,
    };
  }

  /* ------------------------- PATCH ------------------------- */
  async updateOffdays(
    id: string,
    dto: UpdateDoulaOffDaysDto,
    user: any,
  ) {
    const doula = await this.getDoulaProfile(user.id);

    const existing = await this.prisma.doulaOffDays.findFirst({
      where: {
        id,
        doulaProfileId: doula.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Off day not found');
    }

    // Normalize date if provided
    let updatedDate: Date | undefined;
    if (dto.date) {
      updatedDate = new Date(dto.date);
      updatedDate.setUTCHours(0, 0, 0, 0);
    }

    // Merge JSON safely
    const updatedOfftime: Prisma.InputJsonValue | undefined =
      dto.offtime
        ? {
          ...(existing.offtime as object),
          ...dto.offtime,
        }
        : undefined;

    const updated = await this.prisma.doulaOffDays.update({
      where: { id },
      data: {
        ...(updatedDate && { date: updatedDate }),
        ...(updatedOfftime && { offtime: updatedOfftime }),
      },
    });

    return {
      message: 'Off day updated successfully',
      data: updated,
    };
  }

  /* ------------------------- DELETE ------------------------- */

  async removeOffdays(id: string, user: any) {
    const doula = await this.getDoulaProfile(user.id);

    const existing = await this.prisma.doulaOffDays.findFirst({
      where: {
        id,
        doulaProfileId: doula.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Off day not found');
    }

    await this.prisma.doulaOffDays.delete({
      where: { id },
    });

    return {
      message: 'Off day deleted successfully',
    };
  }
  async getAvailableDoulas(
    filters: AvailableDoulasFilterDto,
  ): Promise<{ status: string; data: AvailableDoulaResult[] }> {
    const {
      startDate,
      endDate,
      regionId,
      serviceId,
      shift,
    } = filters;

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (start && isNaN(start.getTime())) {
      throw new BadRequestException('Invalid startDate');
    }
    if (end && isNaN(end.getTime())) {
      throw new BadRequestException('Invalid endDate');
    }

    /* --------------------------------------------------
     * 1. Build date range
     * -------------------------------------------------- */
    const dateList: string[] = [];

    if (start && end) {
      const cursor = new Date(start);
      cursor.setHours(0, 0, 0, 0);

      const endDateOnly = new Date(end);
      endDateOnly.setHours(0, 0, 0, 0);

      while (cursor <= endDateOnly) {
        dateList.push(cursor.toISOString().split('T')[0]);
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    /* --------------------------------------------------
     * 2. Fetch doulas + services
     * -------------------------------------------------- */
    const doulas = await this.prisma.doulaProfile.findMany({
      where: {
        ...(regionId && {
          Region: { some: { id: regionId } },
        }),
        ...(serviceId && {
          ServicePricing: {
            some: { serviceId },
          },
        }),
      },
      select: {
        id: true,
        user: { select: { name: true } },
        ServicePricing: {
          select: {
            service: { select: { name: true } },
          },
        },
      },
    });

    /* --------------------------------------------------
     * 3. Fetch schedules (blocking source)
     * -------------------------------------------------- */
    const BLOCKING_STATUSES: ServiceStatus[] = [
      ServiceStatus.PENDING,
      ServiceStatus.IN_PROGRESS,
    ];

    const schedules = start && end
      ? await this.prisma.schedules.findMany({
        where: {
          cancelledAt: null,
          status: { in: BLOCKING_STATUSES },
          date: {
            gte: start,
            lte: end,
          },
          doulaProfileId: {
            in: doulas.map((d) => d.id),
          },
        },
        select: {
          doulaProfileId: true,
          date: true,
          timeshift: true,
        },
      })
      : [];

    /* --------------------------------------------------
     * 4. Group schedules by doula → date → shifts
     * -------------------------------------------------- */
    const schedulesByDoula = new Map<
      string,
      Map<string, Set<TimeShift>>
    >();

    for (const s of schedules) {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      const dateKey = d.toISOString().split('T')[0];

      if (!schedulesByDoula.has(s.doulaProfileId)) {
        schedulesByDoula.set(s.doulaProfileId, new Map());
      }

      const byDate = schedulesByDoula.get(s.doulaProfileId)!;

      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, new Set());
      }

      byDate.get(dateKey)!.add(s.timeshift);
    }

    /* --------------------------------------------------
     * 5. Map doulas → result
     * -------------------------------------------------- */
    const mapped: (AvailableDoulaResult | null)[] = doulas.map((doula) => {
      let unavailableDays = 0;
      const availableShiftSet = new Set<string>();

      const doulaSchedules = schedulesByDoula.get(doula.id) ?? new Map();

      if (start && end) {
        for (const date of dateList) {
          const blockedShifts = doulaSchedules.get(date);

          if (!blockedShifts) {
            // No booking → all shifts available
            ['MORNING', 'NIGHT', 'FULLDAY'].forEach((s) =>
              availableShiftSet.add(s),
            );
            continue;
          }

          // FULLDAY booking blocks entire day
          if (blockedShifts.has(TimeShift.FULLDAY)) {
            unavailableDays++;
            continue;
          }

          if (!shift) {
            // any booking blocks the day
            unavailableDays++;
            continue;
          }

          if (blockedShifts.has(shift)) {
            unavailableDays++;
          } else {
            availableShiftSet.add(shift);
          }
        }
      } else {
        // No date range → availability not constrained by schedules
        ['MORNING', 'NIGHT', 'FULLDAY'].forEach((s) =>
          availableShiftSet.add(s),
        );
      }

      let shifts = Array.from(availableShiftSet);

      if (shift) {
        shifts = shifts.filter((s) => s === shift);
      }

      if (shifts.length === 0) return null;

      return {
        doulaName: doula.user.name,
        shift: shifts.map((s) => s.toLowerCase()),
        noOfUnavailableDaysInThatPeriod: unavailableDays,
        availableServices: [
          ...new Set(
            doula.ServicePricing.map((sp) => sp.service.name),
          ),
        ],
      };
    });

    /* --------------------------------------------------
     * 6. Filter + sort
     * -------------------------------------------------- */
    const filtered: AvailableDoulaResult[] = mapped.filter(
      (d): d is AvailableDoulaResult => d !== null,
    );

    filtered.sort(
      (a, b) =>
        a.noOfUnavailableDaysInThatPeriod -
        b.noOfUnavailableDaysInThatPeriod,
    );

    /* --------------------------------------------------
     * 7. Response
     * -------------------------------------------------- */
    return {
      status: 'success',
      data: filtered,
    };
  }

}

