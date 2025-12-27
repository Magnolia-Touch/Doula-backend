import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaServiceAvailabilityDto, ServiceAvailabilityDto, UpdateDoulaServiceAvailabilityDto } from './dto/service-availability.dto';
import { Prisma, Role } from '@prisma/client';
import { CreateDoulaOffDaysDto, UpdateDoulaOffDaysDto } from './dto/off-days.dto';

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
    console.log(user)
    // 1. Fetch doula profile
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
    });

    if (!doula) {
      throw new ForbiddenException('Doula profile not found');
    }

    const { date1, date2, offtime } = dto;

    const startDate = new Date(`${date1}T00:00:00.000Z`);
    const endDate = date2
      ? new Date(`${date2}T00:00:00.000Z`)
      : new Date(`${date1}T00:00:00.000Z`);

    if (startDate > endDate) {
      throw new BadRequestException('date1 must be before or equal to date2');
    }

    /**
     * Generate date range (inclusive)
     */
    const dates: Date[] = [];
    const cursor = new Date(startDate);

    while (cursor <= endDate) {
      dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    /**
     * 2. Fetch service availability for these dates
     */
    const availabilities =
      await this.prisma.availableSlotsForService.findMany({
        where: {
          doulaId: doula.id,
          date: { in: dates },
        },
        select: {
          date: true,
          availability: true,
        },
      });

    /**
     * Build lookup map: date → availability
     */
    const availabilityMap = new Map<string, any>();
    for (const a of availabilities) {
      availabilityMap.set(a.date.toISOString(), a.availability);
    }

    /**
     * 3. Validate availability exists + overlaps
     */
    const invalidDates: string[] = [];

    for (const date of dates) {
      const availability = availabilityMap.get(date.toISOString());

      if (!availability) {
        invalidDates.push(date.toISOString().split('T')[0]);
        continue;
      }

      // OPTIONAL: slot-level validation
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
     * 4. Remove already-existing off-days
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

    /**
     * 5. Prepare records
     */
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
     * 6. Create off-days
     */
    await this.prisma.doulaOffDays.createMany({
      data: recordsToCreate,
    });

    return {
      message: 'Off days created successfully',
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


}

