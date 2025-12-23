import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
// import { UpdateZoneManagerDto } from './dto/update-zone-manager.dto';
import { MeetingStatus, Prisma, Role } from '@prisma/client';
import { paginate } from 'src/common/utility/pagination.util';
import { checkUserExistorNot } from 'src/common/utility/service-utils';
import { UpdateDoulaRegionDto } from './dto/update-doula-region.dto';
import { AddDoulaImageDto } from './dto/add-doula-image.dto';
import { UpdateDoulaProfileDto } from './dto/update-doula.dto';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateCertificateDto } from './dto/certificate.dto';
import { paginateWithRelations } from 'src/common/utility/paginate-with-relations.util';

const MAX_GALLERY_IMAGES = 5;

@Injectable()
export class DoulaService {
  constructor(private prisma: PrismaService) {}

  // Create new Doula
  //if admin is creating doula, zone manager of regions are added to doulas profile.
  async create(
    dto: CreateDoulaDto,
    userId: string,
    images: {
      url: string;
    }[] = [],
    profileImageUrl?: string,
  ) {
    console.log('loggg', dto.certificates);
    // -----------------------------
    // Validate logged-in user
    // -----------------------------
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // -----------------------------
    // Validate regions
    // -----------------------------
    const regions = await this.prisma.region.findMany({
      where: { id: { in: dto.regionIds } },
    });

    if (regions.length !== dto.regionIds.length) {
      throw new NotFoundException('One or more region IDs are invalid');
    }

    // -----------------------------
    // Transaction starts
    // -----------------------------
    return await this.prisma.$transaction(async (tx) => {
      let createdUser;

      // =====================================================
      // CASE 1: ZONE MANAGER CREATES DOULA
      // =====================================================
      if (user.role === Role.ZONE_MANAGER) {
        const manager = await tx.zoneManagerProfile.findUnique({
          where: { userId },
        });

        if (!manager) {
          throw new BadRequestException('Zone Manager profile not found');
        }

        createdUser = await tx.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            role: Role.DOULA,
            doulaProfile: {
              create: {
                description: dto.description,
                qualification: dto.qualification,
                achievements: dto.achievements,
                yoe: dto.yoe,
                languages: dto.languages,
                profile_image: profileImageUrl ?? null,
                specialities: dto.specialities,

                Region: {
                  connect: dto.regionIds.map((id) => ({ id })),
                },

                zoneManager: {
                  connect: { id: manager.id },
                },

                DoulaGallery: {
                  create: images,
                },
              },
            },
          },
          include: {
            doulaProfile: true,
          },
        });
      }

      // =====================================================
      // CASE 2: ADMIN CREATES DOULA
      // =====================================================
      if (user.role === Role.ADMIN) {
        const regionsWithManagers = await tx.region.findMany({
          where: { id: { in: dto.regionIds } },
          select: {
            zoneManager: {
              select: { id: true },
            },
          },
        });

        const zoneManagerIds = regionsWithManagers
          .filter((r) => r.zoneManager)
          .map((r) => r.zoneManager!.id);

        if (!zoneManagerIds.length) {
          throw new BadRequestException(
            'Selected regions must have Zone Managers assigned',
          );
        }

        createdUser = await tx.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            role: Role.DOULA,
            doulaProfile: {
              create: {
                description: dto.description,
                qualification: dto.qualification,
                achievements: dto.achievements,
                yoe: dto.yoe,
                languages: dto.languages,
                profile_image: profileImageUrl ?? null,
                specialities: dto.specialities,

                Region: {
                  connect: dto.regionIds.map((id) => ({ id })),
                },

                zoneManager: {
                  connect: zoneManagerIds.map((id) => ({ id })),
                },

                DoulaGallery: {
                  create: images,
                },
              },
            },
          },
          include: {
            doulaProfile: true,
          },
        });
      }

      if (!createdUser) {
        throw new BadRequestException('Unauthorized role');
      }

      // =====================================================
      // SERVICE PRICING CREATION
      // dto.services = { serviceId: price }
      // =====================================================
      if (dto.services) {
        await Promise.all(
          Object.entries(dto.services).map(([serviceId, price]) =>
            tx.servicePricing.create({
              data: {
                doulaProfileId: createdUser.doulaProfile!.id,
                serviceId,
                price,
              },
            }),
          ),
        );
      }
      // =====================================================
      // CERTIFICATES CREATION
      // =====================================================

      const certificates = dto.parsedCertificates;

      if (certificates.length) {
        await tx.certificates.createMany({
          data: certificates.map((cert) => ({
            name: cert.name,
            issuedBy: cert.issuedBy ?? 'Unknown',
            year: cert.year ?? '0000',
            doulaProfileId: createdUser.doulaProfile!.id,
          })),
        });
      }

      // =====================================================
      // FINAL RESPONSE WITH RELATIONS
      // =====================================================
      const doulaWithDetails = await tx.user.findUnique({
        where: { id: createdUser.id },
        include: {
          doulaProfile: {
            include: {
              ServicePricing: {
                select: {
                  id: true,
                  serviceId: true,
                  price: true,
                  service: { select: { name: true, description: true } },
                },
              },
              Region: {
                select: {
                  id: true,
                  regionName: true,
                  pincode: true,
                  zoneManagerId: true,
                },
              },
              zoneManager: true,
              DoulaGallery: true,
              Certificates: true,
            },
          },
        },
      });

      return {
        message: 'Doula created successfully',
        data: doulaWithDetails,
      };
    });
  }

  async get(
    page = 1,
    limit = 10,
    search?: string,
    serviceId?: string,
    isAvailable?: boolean,
    isActive?: boolean,
    regionName?: string,
    minExperience?: number,
    serviceName?: string,
    startDate?: string,
    endDate?: string,
  ) {
    /* ----------------------------------------------------
     * 1. Base user filter
     * -------------------------------------------------- */
    const where: any = {
      role: Role.DOULA,
    };

    /* ----------------------------------------------------
     * 2. Search filters
     * -------------------------------------------------- */
    if (search) {
      const q = search.toLowerCase();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        {
          doulaProfile: {
            Region: { some: { regionName: { contains: q } } },
          },
        },
      ];
    }

    /* ----------------------------------------------------
     * 3. Region filter
     * -------------------------------------------------- */
    if (regionName) {
      where.doulaProfile = {
        ...(where.doulaProfile || {}),
        Region: {
          some: { regionName: { contains: regionName.toLowerCase() } },
        },
      };
    }

    /* ----------------------------------------------------
     * 4. Minimum experience
     * -------------------------------------------------- */
    if (typeof minExperience === 'number') {
      where.doulaProfile = {
        ...(where.doulaProfile || {}),
        yoe: { gte: minExperience },
      };
    }

    /* ----------------------------------------------------
     * 5. Service filters
     * -------------------------------------------------- */
    const servicePricingConditions: any = {};
    if (serviceId) servicePricingConditions.serviceId = serviceId;
    if (serviceName) {
      servicePricingConditions.service = {
        name: { contains: serviceName.toLowerCase() },
      };
    }

    if (Object.keys(servicePricingConditions).length) {
      where.doulaProfile = {
        ...(where.doulaProfile || {}),
        ServicePricing: { some: servicePricingConditions },
      };
    }

    /* ----------------------------------------------------
     * 6. Active filter
     * -------------------------------------------------- */
    if (typeof isActive === 'boolean') {
      where.is_active = isActive;
    }

    /* ----------------------------------------------------
     * 7. Fetch doulas (NO date logic here)
     * -------------------------------------------------- */
    const result = await paginate({
      prismaModel: this.prisma.user,
      page,
      limit,
      where,
      include: {
        doulaProfile: {
          include: {
            Region: true,
            ServicePricing: { include: { service: true } },
            Testimonials: true,
            DoulaGallery: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const users = result.data ?? [];

    if (!users.length) {
      return {
        message: 'Doulas fetched successfully',
        ...result,
        data: [],
      };
    }

    /* ----------------------------------------------------
     * 8. Prepare date range
     * -------------------------------------------------- */
    const rangeStart = startDate ? new Date(startDate) : null;
    const rangeEnd = endDate ? new Date(endDate) : null;

    if (rangeStart) rangeStart.setHours(0, 0, 0, 0);
    if (rangeEnd) rangeEnd.setHours(0, 0, 0, 0);

    /* ----------------------------------------------------
     * 9. Fetch schedules for returned doulas
     * -------------------------------------------------- */
    const doulaProfileIds = users
      .map((u: any) => u.doulaProfile?.id)
      .filter(Boolean);

    const schedules = await this.prisma.schedules.findMany({
      where: {
        doulaProfileId: { in: doulaProfileIds },
        ...(rangeStart || rangeEnd
          ? {
              date: {
                ...(rangeStart && { gte: rangeStart }),
                ...(rangeEnd && { lte: rangeEnd }),
              },
            }
          : {}),
      },
      select: {
        doulaProfileId: true,
        date: true,
      },
    });

    /* ----------------------------------------------------
     * 10. Build schedule lookup
     * -------------------------------------------------- */
    const scheduleMap = new Map<string, Date[]>();

    for (const s of schedules) {
      if (!scheduleMap.has(s.doulaProfileId)) {
        scheduleMap.set(s.doulaProfileId, []);
      }
      scheduleMap.get(s.doulaProfileId)!.push(s.date);
    }

    /* ----------------------------------------------------
     * 11. Transform response
     * -------------------------------------------------- */
    const transformed = users
      .map((user: any) => {
        const profile = user.doulaProfile;
        if (!profile) return null;

        const bookedDates = scheduleMap.get(profile.id) ?? [];

        const services =
          profile.ServicePricing?.map((p) => {
            if (!p.service) return null;
            return {
              servicePricingId: p.id, // ✅ FIX
              serviceId: p.service.id,
              serviceName: p.service.name,
              price: p.price,
            };
          }).filter(Boolean) ?? [];

        const regions =
          profile.Region?.map((r) => ({
            id: r.id,
            name: r.regionName,
          })) ?? [];
        const testimonials = profile.Testimonials ?? [];
        const reviewCount = testimonials.length;

        const avgRating =
          reviewCount > 0
            ? testimonials.reduce((s, t) => s + t.ratings, 0) / reviewCount
            : null;

        const available =
          rangeStart && rangeEnd ? bookedDates.length === 0 : null;

        if (typeof isAvailable === 'boolean' && available !== isAvailable) {
          return null;
        }

        return {
          userId: user.id,
          isActive: user.is_active,
          name: user.name,
          email: user.email,

          profileId: profile.id,
          yoe: profile.yoe ?? null,
          profile_image: profile.profile_image,

          serviceNames: services,
          regionNames: regions,

          ratings: avgRating,
          reviewsCount: reviewCount,

          isAvailable: available,
          nextImmediateAvailabilityDate: bookedDates.length
            ? bookedDates[0]
            : null,

          // ✅ ADD THIS
          images:
            profile.DoulaGallery?.map((img) => ({
              id: img.id,
              url: img.url,
              isPrimary: img.isPrimary ?? false,
            })) ?? [],
        };
      })
      .filter(Boolean);

    return {
      message: 'Doulas fetched successfully',
      ...result,
      data: transformed,
    };
  }

  async getById(id: string) {
    const doula = await this.prisma.user.findUnique({
      where: { id },
      include: {
        doulaProfile: {
          include: {
            Region: true,
            ServicePricing: {
              include: { service: true },
            },
            AvailableSlotsForService: {
              where: {
                availabe: true,
                isBooked: false,
              },
            },
            Testimonials: {
              include: {
                client: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            DoulaGallery: true,
          },
        },
      },
    });

    if (!doula || doula.role !== Role.DOULA) {
      throw new NotFoundException('Doula not found');
    }

    const profile = doula.doulaProfile;

    /* ----------------------------------------------------
     * Services & Regions
     * -------------------------------------------------- */
    const services =
      profile?.ServicePricing?.map((p) => {
        if (!p.service) return null;
        return {
          servicePricingId: p.id, // ✅ FIX
          serviceId: p.service.id,
          serviceName: p.service.name,
          price: p.price,
        };
      }).filter(Boolean) ?? [];

    const regions =
      profile?.Region?.map((r) => ({
        id: r.id,
        name: r.regionName,
      })) ?? [];
    /* ----------------------------------------------------
     * Ratings
     * -------------------------------------------------- */
    const testimonials = profile?.Testimonials ?? [];
    const reviewsCount = testimonials.length;

    const avgRating =
      reviewsCount > 0
        ? testimonials.reduce((sum, t) => sum + t.ratings, 0) / reviewsCount
        : null;

    /* ----------------------------------------------------
     * Next availability (computed from weekday)
     * -------------------------------------------------- */
    const today = new Date();
    const todayIndex = today.getDay(); // 0 (Sun) - 6 (Sat)

    const weekdayOrder: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const availableWeekdays =
      profile?.AvailableSlotsForService?.map((s) => weekdayOrder[s.weekday]) ??
      [];

    const nextImmediateAvailabilityDate =
      availableWeekdays.length > 0
        ? new Date(
            today.setDate(
              today.getDate() +
                Math.min(
                  ...availableWeekdays.map((d) =>
                    d >= todayIndex ? d - todayIndex : 7 - todayIndex + d,
                  ),
                ),
            ),
          )
        : null;

    /* ----------------------------------------------------
     * Final Response
     * -------------------------------------------------- */
    const transformed = {
      userId: doula.id,
      name: doula.name,
      email: doula.email,

      profileId: profile?.id ?? null,
      yoe: profile?.yoe ?? null,
      specialities: profile?.specialities,

      description: profile?.description ?? null,
      achievements: profile?.achievements ?? null,
      qualification: profile?.qualification ?? null,
      profileImage: profile?.profile_image ?? null,

      serviceNames: services,
      regionNames: regions,

      ratings: avgRating,
      reviewsCount,

      nextImmediateAvailabilityDate,

      // ✅ ADD THIS
      galleryImages:
        profile?.DoulaGallery?.map((img) => ({
          id: img.id,
          url: img.url,
          createdAt: img.createdAt,
        })) ?? [],

      testimonials: testimonials.map((t) => ({
        id: t.id,
        rating: t.ratings,
        review: t.reviews,
        clientName: t.client?.user?.name ?? null,
        clientId: t.clientId,
        serviceId: t.serviceId,
        createdAt: t.createdAt,
      })),
    };

    return {
      message: 'Doula fetched successfully',
      data: transformed,
    };
  }

  async delete(id: string) {
    // 1. find user
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: { doulaProfile: true },
    });

    if (!existingUser || existingUser.role !== Role.DOULA) {
      throw new NotFoundException('Doula not found');
    }

    // 2. delete DoulaProfile first
    if (existingUser.doulaProfile) {
      await this.prisma.doulaProfile.delete({
        where: { userId: existingUser.id },
      });
    }

    // 3. delete User
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Doula deleted successfully', data: null };
  }

  async updateStatus(id: string, isActive: boolean) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== Role.DOULA) {
      throw new NotFoundException('Doula not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        is_active: isActive,
      },
    });

    return { message: 'Doula status updated successfully', data: updated };
  }

  async UpdateDoulaRegions(dto: UpdateDoulaRegionDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Validate doula
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { id: dto.profileId },
      include: { zoneManager: true, Region: true },
    });
    if (!doula) throw new NotFoundException('Doula does not exist');

    // Fetch regions with their managers
    const regions = await this.prisma.region.findMany({
      where: { id: { in: dto.regionIds } },
      select: { id: true, zoneManager: { select: { id: true } } },
    });
    if (regions.length !== dto.regionIds.length)
      throw new NotFoundException('One or more region IDs are invalid');

    // ---------------------- ZONE MANAGER FLOW ----------------------
    if (user?.role === Role.ZONE_MANAGER) {
      const zn = await this.prisma.zoneManagerProfile.findUnique({
        where: { userId },
      });
      if (!zn) throw new NotFoundException('Zone Manager profile not found');

      // Check that every region belongs to this zone manager
      const unauthorized = regions.some((r) => r.zoneManager?.id !== zn.id);
      if (unauthorized) {
        throw new BadRequestException(
          'You cannot assign regions that are not managed by you.',
        );
      }

      // Apply add/remove
      const update = await this.prisma.doulaProfile.update({
        where: { id: dto.profileId },
        data: {
          Region: {
            [dto.purpose === 'add' ? 'connect' : 'disconnect']:
              dto.regionIds.map((id) => ({ id })),
          },
          ...(dto.purpose === 'add'
            ? { zoneManager: { connect: { id: zn.id } } }
            : {}), // removing does not detach zone manager
        },
        include: { Region: true, zoneManager: true },
      });

      return {
        message: `Regions ${dto.purpose === 'add' ? 'added' : 'removed'} successfully`,
        data: update,
      };
    }

    // --------------------------- ADMIN FLOW ---------------------------
    if (user?.role === Role.ADMIN) {
      if (dto.purpose === 'add') {
        const zoneManagerIds = regions
          .map((r) => r.zoneManager?.id)
          .filter((id) => id);

        if (zoneManagerIds.length !== regions.length)
          throw new BadRequestException(
            'All selected regions must have a Zone Manager assigned',
          );

        const update = await this.prisma.doulaProfile.update({
          where: { id: dto.profileId },
          data: {
            Region: {
              connect: dto.regionIds.map((id) => ({ id })),
            },
            zoneManager: {
              connect: zoneManagerIds.map((id) => ({ id })),
            },
          },
          include: { Region: true, zoneManager: true },
        });

        return { message: 'Regions added successfully', data: update };
      }

      if (dto.purpose === 'remove') {
        const update = await this.prisma.doulaProfile.update({
          where: { id: dto.profileId },
          data: {
            Region: {
              disconnect: dto.regionIds.map((id) => ({ id })),
            },
          },
          include: { Region: true, zoneManager: true },
        });

        return { message: 'Regions removed successfully', data: update };
      }
    }

    throw new BadRequestException('Invalid purpose');
  }

  async getDoulaMeetings(user: any, page = 1, limit = 10, date?: string) {
    if (user.role !== Role.DOULA) {
      throw new ForbiddenException('Access denied');
    }

    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new ForbiddenException('Doula profile not found');
    }

    const where: any = {
      doulaProfileId: doulaProfile.id,
    };

    // ✅ Apply date filter only if date param exists
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const result = await paginate({
      prismaModel: this.prisma.meetings,
      page,
      limit,
      where,
      include: {
        bookedBy: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    type DoulaMeetingWithClient = Prisma.MeetingsGetPayload<{
      include: {
        bookedBy: {
          include: {
            user: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    }>;

    const meetings = result.data as DoulaMeetingWithClient[];

    return {
      success: true,
      message: 'Doula meetings fetched successfully',
      data: meetings.map((meeting) => ({
        meetingId: meeting.id,
        date: meeting.date,
        serviceName: meeting.serviceName,
        clientName: meeting.bookedBy.user.name,
      })),
      meta: result.meta,
    };
  }

  async getDoulaMeetingDetail(user: any, meetingId: string) {
    if (user.role !== Role.DOULA) {
      throw new ForbiddenException('Access denied');
    }

    // Fetch doula profile
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new ForbiddenException('Doula profile not found');
    }

    const meeting = await this.prisma.meetings.findFirst({
      where: {
        id: meetingId,
        doulaProfileId: doulaProfile.id,
      },
      include: {
        bookedBy: {
          include: {
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
      throw new NotFoundException('Meeting not found');
    }

    return {
      success: true,
      message: 'Doula meeting fetched successfully',
      data: {
        meetingId: meeting.id,
        date: meeting.date,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        status: meeting.status,
        serviceName: meeting.serviceName,

        client: meeting.bookedBy?.user
          ? {
              clientId: meeting.bookedBy.user.id,
              name: meeting.bookedBy.user.name,
              email: meeting.bookedBy.user.email,
            }
          : null,
      },
    };
  }

  async getDoulaSchedules(user: any, page = 1, limit = 10, date?: string) {
    if (user.role !== Role.DOULA) {
      throw new ForbiddenException('Access denied');
    }

    // Fetch doula profile
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new ForbiddenException('Doula profile not found');
    }

    const where: any = {
      doulaProfileId: doulaProfile.id,
    };

    // ✅ Optional date filter (Schedules.date is @db.Date)
    if (date) {
      where.date = new Date(date);
    }

    const result = await paginate({
      prismaModel: this.prisma.schedules,
      page,
      limit,
      where,
      include: {
        ServicePricing: {
          include: {
            service: {
              select: { name: true },
            },
          },
        },
        client: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    type DoulaScheduleWithRelations = Prisma.SchedulesGetPayload<{
      include: {
        ServicePricing: {
          include: {
            service: {
              select: { name: true };
            };
          };
        };
        client: {
          include: {
            user: {
              select: { name: true };
            };
          };
        };
      };
    }>;

    const schedules = result.data as DoulaScheduleWithRelations[];

    return {
      success: true,
      message: 'Doula schedules fetched successfully',
      data: schedules.map((schedule) => ({
        scheduleId: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        serviceName: schedule.ServicePricing.service.name,
        clientName: schedule.client.user.name,
      })),
      meta: result.meta,
    };
  }

  async getDoulaScheduleDetail(user: any, scheduleId: string) {
    if (user.role !== Role.DOULA) {
      throw new ForbiddenException('Access denied');
    }

    // Fetch doula profile
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new ForbiddenException('Doula profile not found');
    }

    const schedule = await this.prisma.schedules.findFirst({
      where: {
        id: scheduleId,
        doulaProfileId: doulaProfile.id,
      },
      include: {
        ServicePricing: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        client: {
          include: {
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

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return {
      success: true,
      message: 'Doula schedule fetched successfully',
      data: {
        scheduleId: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        status: schedule.status,

        service: {
          servicePricingId: schedule.ServicePricing.id,
          serviceId: schedule.ServicePricing.service.id,
          serviceName: schedule.ServicePricing.service.name,
          price: schedule.ServicePricing.price,
        },

        client: schedule.client?.user
          ? {
              clientId: schedule.client.user.id,
              name: schedule.client.user.name,
              email: schedule.client.user.email,
            }
          : null,
      },
    };
  }

  async getDoulaScheduleCount(user: any) {
    if (user.role !== Role.DOULA) {
      throw new ForbiddenException('Access denied');
    }

    // Get Doula profile
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new ForbiddenException('Doula profile not found');
    }

    /** -----------------------------
     * Date calculations
     * ----------------------------- */

    // Today (Schedules.date is @db.Date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start of week (Monday)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay(); // 0 = Sunday
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    // End of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    /** -----------------------------
     * Counts
     * ----------------------------- */

    const [todayCount, weeklyCount] = await Promise.all([
      // Today's schedules
      this.prisma.schedules.count({
        where: {
          doulaProfileId: doulaProfile.id,
          date: today,
        },
      }),

      // Weekly schedules
      this.prisma.schedules.count({
        where: {
          doulaProfileId: doulaProfile.id,
          date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      }),
    ]);

    return {
      success: true,
      message: 'Doula schedule counts fetched successfully',
      data: {
        today: todayCount,
        thisWeek: weeklyCount,
      },
    };
  }

  async ImmediateMeeting(user: any) {
    if (user.role !== Role.DOULA) {
      throw new ForbiddenException('Access denied');
    }

    // Fetch doula profile
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new ForbiddenException('Doula profile not found');
    }

    const now = new Date();

    // Fetch next upcoming meeting
    const meeting = await this.prisma.meetings.findFirst({
      where: {
        doulaProfileId: doulaProfile.id,
        status: MeetingStatus.SCHEDULED, // adjust if needed
        OR: [
          {
            date: { gt: now },
          },
          {
            date: now,
            startTime: { gte: now },
          },
        ],
      },
      include: {
        bookedBy: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        Service: {
          select: { name: true },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    if (!meeting) {
      return {
        success: true,
        message: 'No upcoming meetings',
        data: null,
      };
    }

    // Calculate time remaining
    const meetingDateTime = new Date(meeting.date);
    meetingDateTime.setHours(
      meeting.startTime.getHours(),
      meeting.startTime.getMinutes(),
      0,
      0,
    );

    const diffMs = meetingDateTime.getTime() - now.getTime();
    const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

    return {
      success: true,
      message: 'Immediate meeting fetched successfully',
      data: {
        clientName: meeting.bookedBy.user.name,
        serviceName: meeting.Service?.name ?? meeting.serviceName,
        startTime: meeting.startTime,
        timeToStart: `in ${diffMinutes} mins`,
        meetingLink: meeting.link,
      },
    };
  }

  async getDoulaRatingSummary(user: any) {
    if (user.role !== Role.DOULA) {
      throw new ForbiddenException('Access denied');
    }

    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new ForbiddenException('Doula profile not found');
    }

    // Fetch all ratings for this doula
    const testimonials = await this.prisma.testimonials.findMany({
      where: {
        doulaProfileId: doulaProfile.id,
      },
      select: {
        ratings: true,
      },
    });

    const totalReviews = testimonials.length;

    if (totalReviews === 0) {
      return {
        success: true,
        message: 'No reviews yet',
        data: {
          averageRating: 0,
          totalReviews: 0,
          distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
        },
      };
    }

    // Initialize distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let ratingSum = 0;

    for (const t of testimonials) {
      distribution[t.ratings]++;
      ratingSum += t.ratings;
    }

    const averageRating = Number((ratingSum / totalReviews).toFixed(1));

    return {
      success: true,
      message: 'Doula rating summary fetched successfully',
      data: {
        averageRating,
        totalReviews,
        distribution,
      },
    };
  }

  async getDoulaTestimonials(user: any, page = 1, limit = 10) {
    if (user.role !== Role.DOULA) {
      throw new ForbiddenException('Access denied');
    }

    // Fetch doula profile
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new ForbiddenException('Doula profile not found');
    }

    const result = await paginate({
      prismaModel: this.prisma.testimonials,
      page,
      limit,
      where: {
        doulaProfileId: doulaProfile.id,
      },
      include: {
        client: {
          include: {
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
        ServicePricing: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    type DoulaTestimonialWithRelations = Prisma.TestimonialsGetPayload<{
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
                email: true;
                phone: true;
              };
            };
          };
        };
        ServicePricing: {
          include: {
            service: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    }>;

    const testimonials = result.data as DoulaTestimonialWithRelations[];

    return {
      success: true,
      message: 'Doula testimonials fetched successfully',
      data: testimonials.map((t) => ({
        clientId: t.client.user.id,
        clientName: t.client.user.name,
        email: t.client.user.email,
        phone: t.client.user.phone,
        ratings: t.ratings,
        reviews: t.reviews,
        createdAt: t.createdAt,
        serviceName: t.ServicePricing.service.name,
        servicePricingId: t.ServicePricing.id,
      })),
      meta: result.meta,
    };
  }

  async doulaProfile(user: any) {
    if (user.role !== Role.DOULA) {
      throw new ForbiddenException('Access denied');
    }

    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        Region: {
          select: {
            regionName: true,
          },
        },
        Testimonials: {
          select: {
            ratings: true,
          },
        },
        DoulaGallery: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
        },
      },
    });

    if (!doula) {
      throw new NotFoundException('Doula profile not found');
    }

    /** -----------------------
     * Rating calculations
     * ---------------------- */
    const totalReviews = doula.Testimonials.length;
    const ratingSum = doula.Testimonials.reduce((sum, r) => sum + r.ratings, 0);

    const averageRating =
      totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0;

    const satisfaction =
      totalReviews > 0 ? Math.round((ratingSum / (totalReviews * 5)) * 100) : 0;

    /** -----------------------
     * Response
     * ---------------------- */
    return {
      success: true,
      message: 'Doula profile fetched successfully',
      data: {
        id: doula.id,

        // Header
        name: doula.user.name,
        title: 'Certified Birth Doula',
        averageRating,
        totalReviews,

        // Stats
        births: 0, // optional: derive from ServiceBooking
        experience: doula.yoe ?? 0,
        satisfaction,

        // Contact
        contact: {
          email: doula.user.email,
          phone: doula.user.phone,
          location: doula.Region?.[0]?.regionName ?? null,
        },

        // About
        about: doula.description,

        // Certifications
        certifications: [
          ...(doula.qualification
            ? doula.qualification.split(',').map((q) => q.trim())
            : []),
          ...(doula.achievements
            ? doula.achievements.split(',').map((a) => a.trim())
            : []),
        ],

        // Gallery
        gallery: doula.DoulaGallery.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
        })),
      },
    };
  }

  async addDoulaprofileImage(userId: string, profileImageUrl?: string) {
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }
    await this.prisma.doulaProfile.update({
      where: { userId: userId },
      data: { profile_image: profileImageUrl },
    });

    return {
      message: 'Image uploaded successfully',
      data: doulaProfile,
    };
  }

  async getDoulaImages(userId: string) {
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId },
      select: { id: true, profile_image: true },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const images = await this.prisma.doulaProfile.findUnique({
      where: {
        userId: doulaProfile.id,
      },
      select: { profile_image: true },
    });

    return {
      status: 'success',
      message: 'Doula Profile Image fetched successfully',
      data: doulaProfile,
    };
  }

  async deleteDoulaprofileImage(userId: string) {
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId },
    });
    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }
    const image = await this.prisma.doulaProfile.update({
      where: { userId: userId },
      data: { profile_image: null },
    });
    return { message: 'Image deleted successfully' };
  }

  async addDoulaGalleryImages(
    userId: string,
    files: Express.Multer.File[],
    altText?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const galleryData = files.map((file) => ({
      doulaProfileId: doulaProfile.id,
      url: `uploads/doulas/${file.filename}`,
      altText,
    }));

    await this.prisma.doulaGallery.createMany({
      data: galleryData,
    });

    const images = await this.prisma.doulaGallery.findMany({
      where: {
        doulaProfileId: doulaProfile.id,
        url: {
          in: galleryData.map((g) => g.url),
        },
      },
      select: {
        id: true,
        url: true,
        altText: true,
        createdAt: true,
      },
    });

    return {
      message: 'Gallery images uploaded successfully',
      data: images,
    };
  }

  async getDoulaGalleryImages(userId: string) {
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const images = await this.prisma.doulaGallery.findMany({
      where: {
        doulaProfileId: doulaProfile.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      status: 'success',
      message: 'Doula gallery images fetched successfully',
      data: images,
    };
  }

  async deleteDoulaGalleryImage(userId: string, imageId: string) {
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const image = await this.prisma.doulaGallery.findUnique({
      where: { id: imageId },
    });

    if (!image || image.doulaProfileId !== doulaProfile.id) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.doulaGallery.delete({
      where: { id: imageId },
    });

    return {
      message: 'Gallery image deleted successfully',
    };
  }

  async updateDoulaProfile(userId: string, dto: UpdateDoulaProfileDto) {
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const {
      name,
      is_active,
      description,
      achievements,
      qualification,
      yoe,
      languages,
      specialities,
    } = dto;

    const data = await this.prisma.$transaction([
      // Update User table
      this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(is_active !== undefined && { is_active }),
        },
      }),

      // Update DoulaProfile table
      this.prisma.doulaProfile.update({
        where: { userId },
        data: {
          ...(description !== undefined && { description }),
          ...(achievements !== undefined && { achievements }),
          ...(qualification !== undefined && { qualification }),
          ...(yoe !== undefined && { yoe }),
          ...(languages !== undefined && { languages }),
          ...(specialities !== undefined && { specialities }),
        },
      }),
    ]);

    return {
      message: 'Doula profile updated successfully',
      data: data,
    };
  }

  // Helper: get doula profile
  private async getDoulaProfile(userId: string) {
    const profile = await this.prisma.doulaProfile.findUnique({
      where: { userId: userId },
    });

    if (!profile) {
      throw new NotFoundException('Doula profile not found');
    }

    return profile;
  }

  // GET all
  async getCertificates(userId: string) {
    const doulaProfile = await this.getDoulaProfile(userId);
    console.log('dola, ', doulaProfile);
    return this.prisma.certificates.findMany({
      where: { doulaProfileId: doulaProfile.id },
      orderBy: { year: 'desc' },
    });
  }

  // GET by ID
  async getCertificateById(userId: string, certificateId: string) {
    const doulaProfile = await this.getDoulaProfile(userId);

    const certificate = await this.prisma.certificates.findFirst({
      where: {
        id: certificateId,
        doulaProfileId: doulaProfile.id,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  // UPDATE
  async updateCertificate(
    userId: string,
    certificateId: string,
    dto: UpdateCertificateDto,
  ) {
    const doulaProfile = await this.getDoulaProfile(userId);

    const certificate = await this.prisma.certificates.findFirst({
      where: {
        id: certificateId,
        doulaProfileId: doulaProfile.id,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return this.prisma.certificates.update({
      where: { id: certificateId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.issuedBy !== undefined && { issuedBy: dto.issuedBy }),
        ...(dto.year !== undefined && { year: dto.year }),
      },
    });
  }

  // DELETE
  async deleteCertificate(userId: string, certificateId: string) {
    const doulaProfile = await this.getDoulaProfile(userId);

    const certificate = await this.prisma.certificates.findFirst({
      where: {
        id: certificateId,
        doulaProfileId: doulaProfile.id,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    await this.prisma.certificates.delete({
      where: { id: certificateId },
    });

    return {
      message: 'Certificate deleted successfully',
    };
  }

  async getServiceBookings(userId: string, page = 1, limit = 10) {
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        user: {
          select: { name: true },
        },
      },
    });
    if (!doula) {
      throw new NotFoundException('Doula profile not found');
    }
    type ServiceBookingWithRelations = Prisma.ServiceBookingGetPayload<{
      include: {
        region: {
          select: {
            id: true;
            regionName: true;
          };
        };
        service: {
          select: {
            id: true;
            service: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
        schedules: {
          select: {
            id: true;
          };
        };
      };
    }>;

    const result = await paginateWithRelations<ServiceBookingWithRelations>({
      page,
      limit,
      query: () =>
        this.prisma.serviceBooking.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: {
            doulaProfileId: doula.id,
          },
          orderBy: {
            startDate: 'desc',
          },
          include: {
            region: {
              select: {
                id: true,
                regionName: true,
              },
            },
            service: {
              select: {
                id: true,
                service: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            schedules: {
              select: {
                id: true,
              },
            },
          },
        }),
      countQuery: () =>
        this.prisma.serviceBooking.count({
          where: {
            doulaProfileId: doula.id,
          },
        }),
    });

    return {
      data: result.data.map((booking) => ({
        serviceBookingId: booking.id,
        satisfiestartDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        regionId: booking.region.id,
        regionName: booking.region.regionName,
        servicePricingId: booking.service.id,
        serviceName: booking.service.service.name,
        serviceId: booking.service.service.id,
        schedulesCount: booking.schedules.length,
      })),
      meta: result.meta,
    };
  }

  async getServiceBookingsinDetail(userId: string, serviceBookingId: string) {
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        user: {
          select: { name: true },
        },
      },
    });
    if (!doula) {
      throw new NotFoundException('Doula profile not found');
    }
    const booking = await this.prisma.serviceBooking.findUnique({
      where: { id: serviceBookingId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        region: {
          select: {
            id: true,
            regionName: true,
            zoneManager: {
              select: {
                id: true,
                user: { select: { id: true, email: true, name: true } },
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            price: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        schedules: true,
      },
    });
    if (!booking) {
      throw new NotFoundException('Service booking not found');
    }

    return {
      serviceBookingId: booking.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,

      region: {
        id: booking.region.id,
        name: booking.region.regionName,
        zoneManager: booking.region.zoneManager?.user
          ? {
              id: booking.region.zoneManager.id,
              name: booking.region.zoneManager.user.name,
              email: booking.region.zoneManager.user.email,
            }
          : null,
      },

      service: {
        servicePricingId: booking.service.id,
        serviceId: booking.service.service.id,
        serviceName: booking.service.service.name,
        price: booking.service.price,
      },

      schedules: booking.schedules.map((schedule) => ({
        id: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        status: schedule.status,
      })),
    };
  }
}
