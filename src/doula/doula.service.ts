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
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';
import { paginateWithRelations } from 'src/common/utility/paginate-with-relations.util';
import { PriceBreakdownDto } from 'src/service-pricing/dto/service-pricing.dto';
import { CalculatePricingDto } from './dto/calculate-pricing.dto';
import {
  generateVisitDatesforBirthDoula,
  generateVisitDatesforPostPartumDoula,
  getPriceForShift,
  isDoulaAvailableForShift,
  isDoulaOffOnShift,
} from 'src/common/utility/service-utils';
import { TimeShift } from '@prisma/client';
import { S3Service } from 'src/s3/s3.service';

const MAX_GALLERY_IMAGES = 5;

@Injectable()
export class DoulaService {
  constructor(private prisma: PrismaService, private readonly s3Service: S3Service) { }


  private async buildDoulaProfileResponse(userId: string) {
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
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
        Certificates: {
          select: { id: true, issuedBy: true, name: true, year: true },
        },
        ServicePricing: {
          include: { service: true },
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
    const ratingSum = doula.Testimonials.reduce(
      (sum, r) => sum + r.ratings,
      0,
    );

    const averageRating =
      totalReviews > 0
        ? Number((ratingSum / totalReviews).toFixed(1))
        : 0;

    const satisfaction =
      totalReviews > 0
        ? Math.round((ratingSum / (totalReviews * 5)) * 100)
        : 0;

    /** -----------------------
     * Final response shape
     * ---------------------- */
    return {
      id: doula.id,
      userId: doula.user.id,
      // Header
      name: doula.user.name,
      title: 'Certified Birth Doula',
      averageRating,
      totalReviews,

      // Stats
      births: 0,
      experience: doula.yoe ?? 0,
      satisfaction,
      qualification: doula.qualification,

      // Contact
      contact: {
        email: doula.user.email,
        phone: doula.user.phone,
        location: doula.Region?.[0]?.regionName ?? null,
      },

      // About
      about: doula.description,

      servicePricing: doula.ServicePricing.map((pricing) => ({
        servicePricingid: pricing.id,
        servicename: pricing.service.name,
        price: pricing.price,
      })),

      certificates: doula.Certificates.map((cert) => ({
        certificateId: cert.id,
        name: cert.name,
        issuedBy: cert.issuedBy,
        year: cert.year,
      })),

      gallery: doula.DoulaGallery.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
      })),
    };
  }

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
     * 7. Fetch doulas
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
            Certificates: true,
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
     * 9. Fetch schedules
     * -------------------------------------------------- */
    const doulaProfileIds = users
      .map((u: any) => u.doulaProfile?.id)
      .filter(Boolean);

    const schedules = await this.prisma.schedules.findMany({
      where: {
        doulaProfileId: { in: doulaProfileIds },
        cancelledAt: null,
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
     * 9.1 Fetch available slots
     * -------------------------------------------------- */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableSlots =
      await this.prisma.availableSlotsForService.findMany({
        where: {
          doulaId: { in: doulaProfileIds },
          date: { gte: today },
        },
        select: {
          doulaId: true,
          date: true,
          availability: true,
        },
        orderBy: { date: 'asc' },
      });

    /* ----------------------------------------------------
     * 10. Build lookups
     * -------------------------------------------------- */
    const scheduleMap = new Map<string, Date[]>();

    for (const s of schedules) {
      if (!scheduleMap.has(s.doulaProfileId)) {
        scheduleMap.set(s.doulaProfileId, []);
      }
      scheduleMap.get(s.doulaProfileId)!.push(s.date);
    }

    const availabilityMap = new Map<
      string,
      { date: Date; availability: Record<string, boolean> }[]
    >();

    for (const slot of availableSlots) {
      if (!availabilityMap.has(slot.doulaId)) {
        availabilityMap.set(slot.doulaId, []);
      }
      availabilityMap.get(slot.doulaId)!.push({
        date: slot.date,
        availability: slot.availability as Record<string, boolean>,
      });
    }

    /* ----------------------------------------------------
     * 10.1 Helpers
     * -------------------------------------------------- */
    const normalizeDate = (d: Date) => {
      const n = new Date(d);
      n.setHours(0, 0, 0, 0);
      return n.getTime();
    };

    function isDateAvailable(
      date: Date,
      availability: Record<string, boolean>,
      bookedDates: Date[],
    ) {
      // Any shift false → unavailable
      if (Object.values(availability).some((v) => v === false)) {
        return false;
      }

      // All shifts true → must not be booked
      return !bookedDates.some(
        (d) => normalizeDate(d) === normalizeDate(date),
      );
    }

    /* ----------------------------------------------------
     * 11. Transform response
     * -------------------------------------------------- */
    const transformed = users
      .map((user: any) => {
        const profile = user.doulaProfile;
        if (!profile) return null;

        const bookedDates = scheduleMap.get(profile.id) ?? [];
        const slotEntries = availabilityMap.get(profile.id) ?? [];

        let nextAvailableDate: Date | null = null;

        for (const slot of slotEntries) {
          if (
            isDateAvailable(
              slot.date,
              slot.availability,
              bookedDates,
            )
          ) {
            nextAvailableDate = slot.date;
            break;
          }
        }

        const available =
          rangeStart && rangeEnd
            ? slotEntries.some((slot) =>
              isDateAvailable(
                slot.date,
                slot.availability,
                bookedDates,
              ),
            )
            : null;

        if (typeof isAvailable === 'boolean' && available !== isAvailable) {
          return null;
        }

        const services =
          profile.ServicePricing?.map((p) =>
            p.service
              ? {
                servicePricingId: p.id,
                serviceId: p.service.id,
                serviceName: p.service.name,
                price: p.price,
              }
              : null,
          ).filter(Boolean) ?? [];

        return {
          userId: user.id,
          isActive: user.is_active,
          name: user.name,
          email: user.email,

          profileId: profile.id,
          yoe: profile.yoe ?? null,
          profile_image: profile.profile_image,

          serviceNames: services,
          regionNames:
            profile.Region?.map((r) => ({
              id: r.id,
              name: r.regionName,
            })) ?? [],

          ratings:
            profile.Testimonials?.length > 0
              ? profile.Testimonials.reduce(
                (s, t) => s + t.ratings,
                0,
              ) / profile.Testimonials.length
              : null,

          reviewsCount: profile.Testimonials?.length ?? 0,
          isAvailable: available,
          nextImmediateAvailabilityDate: nextAvailableDate,

          images:
            profile.DoulaGallery?.map((img) => ({
              id: img.id,
              url: img.url,
              isPrimary: img.isPrimary ?? false,
            })) ?? [],

          certificates:
            profile.Certificates?.map((cert) => ({
              id: cert.id,
              name: cert.name,
              issuedBy: cert.issuedBy,
              year: cert.year,
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
            AvailableSlotsForService: true,
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
            Certificates: true,
          },
        },
      },
    });

    if (!doula || doula.role !== Role.DOULA) {
      throw new NotFoundException('Doula not found');
    }

    const profile = doula.doulaProfile;
    if (!profile) {
      throw new NotFoundException('Doula profile not found');
    }

    /* ----------------------------------------------------
     * Services & Regions
     * -------------------------------------------------- */
    const services =
      profile.ServicePricing?.map((p) =>
        p.service
          ? {
            servicePricingId: p.id,
            serviceId: p.service.id,
            serviceName: p.service.name,
            price: p.price,
          }
          : null,
      ).filter(Boolean) ?? [];

    const regions =
      profile.Region?.map((r) => ({
        id: r.id,
        name: r.regionName,
      })) ?? [];

    /* ----------------------------------------------------
     * Ratings
     * -------------------------------------------------- */
    const testimonials = profile.Testimonials ?? [];
    const reviewsCount = testimonials.length;

    const avgRating =
      reviewsCount > 0
        ? testimonials.reduce((sum, t) => sum + t.ratings, 0) /
        reviewsCount
        : null;

    /* ----------------------------------------------------
     * Next availability (SAME LOGIC as get())
     * -------------------------------------------------- */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await this.prisma.schedules.findMany({
      where: {
        doulaProfileId: profile.id,
        date: { gte: today },
        cancelledAt: null,
      },
      select: { date: true },
    });

    const bookedDates = schedules.map((s) => s.date);

    const availableSlots =
      await this.prisma.availableSlotsForService.findMany({
        where: {
          doulaId: profile.id,
          date: { gte: today },
        },
        select: {
          date: true,
          availability: true,
        },
        orderBy: { date: 'asc' },
      });

    const normalizeDate = (d: Date) => {
      const n = new Date(d);
      n.setHours(0, 0, 0, 0);
      return n.getTime();
    };

    function isDateAvailable(
      date: Date,
      availability: Record<string, boolean>,
      bookedDates: Date[],
    ) {
      // Any shift false → unavailable
      if (Object.values(availability).some((v) => v === false)) {
        return false;
      }

      // All shifts true → must not be booked
      return !bookedDates.some(
        (d) => normalizeDate(d) === normalizeDate(date),
      );
    }

    let nextImmediateAvailabilityDate: Date | null = null;

    for (const slot of availableSlots) {
      if (
        isDateAvailable(
          slot.date,
          slot.availability as Record<string, boolean>,
          bookedDates,
        )
      ) {
        nextImmediateAvailabilityDate = slot.date;
        break;
      }
    }

    /* ----------------------------------------------------
     * Final Response
     * -------------------------------------------------- */
    const transformed = {
      userId: doula.id,
      name: doula.name,
      email: doula.email,

      profileId: profile.id,
      yoe: profile.yoe ?? null,
      specialities: profile.specialities,

      description: profile.description ?? null,
      qualification: profile.qualification ?? null,
      profileImage: profile.profile_image ?? null,

      serviceNames: services,
      regionNames: regions,

      ratings: avgRating,
      reviewsCount,

      nextImmediateAvailabilityDate,

      galleryImages:
        profile.DoulaGallery?.map((img) => ({
          id: img.id,
          url: img.url,
          createdAt: img.createdAt,
        })) ?? [],

      certificates:
        profile.Certificates?.map((cert) => ({
          id: cert.id,
          name: cert.name,
          issuedBy: cert.issuedBy,
          year: cert.year,
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
              select: { name: true, id: true, },
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
                name: true, id: true, email: true, phone: true
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
        clientEmail: meeting.bookedBy.user.email,
        clientPhone: meeting.bookedBy.user.phone,
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
              select: { id: true, name: true, email: true, phone: true, address: true };
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
        TimeShift: schedule.timeshift,
        date: schedule.date,
        timeshift: schedule.timeshift,
        serviceName: schedule.ServicePricing.service.name,
        clientId: schedule.client.user.id,
        clientName: schedule.client.user.name,
        clientEmail: schedule.client.user.email,
        clientPhone: schedule.client.user.phone,
        clientAddress: schedule.client.user.address,
        status: schedule.status,
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
                phone: true,
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
        timeshift: schedule.timeshift,

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
            phone: schedule.client.user.phone,
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

    const data = await this.buildDoulaProfileResponse(user.id);


    /** -----------------------
     * Response
     * ---------------------- */
    return {
      success: true,
      message: 'Doula profile fetched successfully',
      data: data
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
    images: {
      url: string;
    }[] = [],
    altText?: string,
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { userId },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    const galleryData = images.map((image) => ({
      doulaProfileId: doulaProfile.id,
      url: image.url,
      altText,
    }));

    await this.prisma.doulaGallery.createMany({
      data: galleryData,
    });

    const galleryImages = await this.prisma.doulaGallery.findMany({
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
      data: galleryImages,
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
    await this.s3Service.deleteFile(image.url);

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
      about,
      achievements,
      qualification,
      experience,
      languages,
      specialities,
      certificates,
      servicePricings,
    } = dto;

    const operations: any[] = [];

    /**
     * 1. Update User
     */
    if (name !== undefined || is_active !== undefined) {
      operations.push(
        this.prisma.user.update({
          where: { id: userId },
          data: {
            ...(name !== undefined && { name }),
            ...(is_active !== undefined && { is_active }),
          },
        }),
      );
    }

    /**
     * 2. Update Service Pricing
     */
    const toJsonPrice = (price: PriceBreakdownDto): Prisma.InputJsonObject => ({
      morning: price.morning,
      night: price.night,
      fullday: price.fullday,
    });

    if (servicePricings?.length) {
      for (const pricing of servicePricings) {
        operations.push(
          this.prisma.servicePricing.updateMany({
            where: {
              id: pricing.servicePricingId,
              doulaProfileId: doulaProfile.id,
            },
            data: {
              price: toJsonPrice(pricing.price),
            },
          }),
        );
      }
    }

    /**
     * 3. Update Doula Profile
     */
    operations.push(
      this.prisma.doulaProfile.update({
        where: { userId },
        data: {
          ...(about !== undefined && { description: about }),
          ...(achievements !== undefined && { achievements }),
          ...(qualification !== undefined && { qualification }),
          ...(experience !== undefined && { yoe: experience }),
          ...(languages !== undefined && { languages }),
          ...(specialities !== undefined && { specialities }),
        },
      }),
    );

    /**
     * 4. Update Certificates
     */
    if (certificates?.length) {
      for (const cert of certificates) {
        operations.push(
          this.prisma.certificates.updateMany({
            where: {
              id: cert.certificateId,
              doulaProfileId: doulaProfile.id,
            },
            data: {
              ...(cert.data.name !== undefined && {
                name: cert.data.name,
              }),
              ...(cert.data.issuedBy !== undefined && {
                issuedBy: cert.data.issuedBy,
              }),
              ...(cert.data.year !== undefined && {
                year: cert.data.year,
              }),
            },
          }),
        );
      }
    }

    /**
     * 5. Atomic commit
     */
    await this.prisma.$transaction(operations);

    /**
     * 6. Return SAME response as GET profile
     */
    const data = await this.buildDoulaProfileResponse(userId);

    return {
      success: true,
      message: 'Doula profile updated successfully',
      data,
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


  // UPDATE
  async addCertificate(
    userId: string,
    dto: CreateCertificateDto,
  ) {
    const { name, issuedBy, year } = dto
    const doulaProfile = await this.getDoulaProfile(userId);

    const certificate = await this.prisma.certificates.create({
      data: {
        doulaProfileId: doulaProfile.id,
        name: name,
        issuedBy: issuedBy,
        year: year
      },
    });
    return { message: 'Certificate Added Succesfully', data: certificate }
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

  // async getServiceBookings(userId: string, page = 1, limit = 10) {
  //   const doula = await this.prisma.doulaProfile.findUnique({
  //     where: { userId: userId },
  //     select: {
  //       id: true,
  //       user: {
  //         select: { name: true },
  //       },
  //     },
  //   });
  //   if (!doula) {
  //     throw new NotFoundException('Doula profile not found');
  //   }
  //   type ServiceBookingWithRelations = Prisma.ServiceBookingGetPayload<{
  //     include: {
  //       region: {
  //         select: {
  //           id: true;
  //           regionName: true;
  //         };
  //       };
  //       service: {
  //         select: {
  //           id: true;
  //           service: {
  //             select: {
  //               id: true;
  //               name: true;
  //             };
  //           };
  //         };
  //       };
  //       schedules: {
  //         select: {
  //           id: true;
  //         };
  //       };
  //     };
  //   }>;

  //   const result = await paginateWithRelations<ServiceBookingWithRelations>({
  //     page,
  //     limit,
  //     query: () =>
  //       this.prisma.serviceBooking.findMany({
  //         skip: (page - 1) * limit,
  //         take: limit,
  //         where: {
  //           doulaProfileId: doula.id,
  //         },
  //         orderBy: {
  //           startDate: 'desc',
  //         },
  //         include: {
  //           region: {
  //             select: {
  //               id: true,
  //               regionName: true,
  //             },
  //           },
  //           service: {
  //             select: {
  //               id: true,
  //               service: {
  //                 select: {
  //                   id: true,
  //                   name: true,
  //                 },
  //               },
  //             },
  //           },
  //           schedules: {
  //             select: {
  //               id: true,
  //             },
  //           },
  //         },
  //       }),
  //     countQuery: () =>
  //       this.prisma.serviceBooking.count({
  //         where: {
  //           doulaProfileId: doula.id,
  //         },
  //       }),
  //   });

  //   return {
  //     data: result.data.map((booking) => ({
  //       serviceBookingId: booking.id,
  //       satisfiestartDate: booking.startDate,
  //       endDate: booking.endDate,
  //       status: booking.status,
  //       regionId: booking.region.id,
  //       regionName: booking.region.regionName,
  //       servicePricingId: booking.service.id,
  //       serviceName: booking.service.service.name,
  //       serviceId: booking.service.service.id,
  //       schedulesCount: booking.schedules.length,
  //     })),
  //     meta: result.meta,
  //   };
  // }

  // async getServiceBookingsinDetail(userId: string, serviceBookingId: string) {
  //   const doula = await this.prisma.doulaProfile.findUnique({
  //     where: { userId: userId },
  //     select: {
  //       id: true,
  //       user: {
  //         select: { name: true },
  //       },
  //     },
  //   });
  //   if (!doula) {
  //     throw new NotFoundException('Doula profile not found');
  //   }
  //   const booking = await this.prisma.serviceBooking.findUnique({
  //     where: { id: serviceBookingId },
  //     select: {
  //       id: true,
  //       startDate: true,
  //       endDate: true,
  //       status: true,
  //       region: {
  //         select: {
  //           id: true,
  //           regionName: true,
  //           zoneManager: {
  //             select: {
  //               id: true,
  //               user: { select: { id: true, email: true, name: true } },
  //             },
  //           },
  //         },
  //       },
  //       service: {
  //         select: {
  //           id: true,
  //           price: true,
  //           service: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //         },
  //       },
  //       schedules: true,
  //     },
  //   });
  //   if (!booking) {
  //     throw new NotFoundException('Service booking not found');
  //   }

  //   return {
  //     serviceBookingId: booking.id,
  //     startDate: booking.startDate,
  //     endDate: booking.endDate,
  //     status: booking.status,

  //     region: {
  //       id: booking.region.id,
  //       name: booking.region.regionName,
  //       zoneManager: booking.region.zoneManager?.user
  //         ? {
  //           id: booking.region.zoneManager.id,
  //           name: booking.region.zoneManager.user.name,
  //           email: booking.region.zoneManager.user.email,
  //         }
  //         : null,
  //     },

  //     service: {
  //       servicePricingId: booking.service.id,
  //       serviceId: booking.service.service.id,
  //       serviceName: booking.service.service.name,
  //       price: booking.service.price,
  //     },

  //     schedules: booking.schedules.map((schedule) => ({
  //       id: schedule.id,
  //       date: schedule.date,
  //       timeshift: schedule.timeshift,
  //       status: schedule.status,
  //     })),
  //   };
  // }


  async getServiceBookings(userId: string, page = 1, limit = 10) {
    /* ---------------- FETCH DOULA ---------------- */
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doula) {
      throw new NotFoundException('Doula profile not found');
    }

    /* ---------------- TYPES ---------------- */
    type ServiceBookingWithRelations =
      Prisma.ServiceBookingGetPayload<{
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
              price: true;
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
          client: {
            select: {
              id: true;
              user: {
                select: {
                  name: true;
                  email: true;
                  phone: true;
                };
              };
            };
          };
        };
      }>;

    /* ---------------- PAGINATION ---------------- */
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
                price: true,
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
            client: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
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

    /* ---------------- RESPONSE ---------------- */
    return {
      data: result.data.map((booking) => {
        const schedulesCount = booking.schedules.length;
        const totalPrice = booking.totalAmount

        return {
          serviceBookingId: booking.id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          timeShift: booking.timeshift,
          status: booking.status,
          totalAmount: booking.totalAmount,

          client: {
            name: booking.client.user.name,
            email: booking.client.user.email,
            phone: booking.client.user.phone,
          },

          region: {
            id: booking.region.id,
            name: booking.region.regionName,

          },

          service: {
            servicePricingId: booking.service.id,
            serviceId: booking.service.service.id,
            serviceName: booking.service.service.name,
            pricePerVisit: booking.service.price,
          },

          schedulesCount,
          totalPrice,
        };
      }),
      meta: result.meta,
    };
  }


  async getServiceBookingsInDetail(
    userId: string,
    serviceBookingId: string,
  ) {
    /* ---------------- FETCH DOULA ---------------- */
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doula) {
      throw new NotFoundException('Doula profile not found');
    }

    /* ---------------- FETCH BOOKING ---------------- */
    const booking = await this.prisma.serviceBooking.findUnique({
      where: { id: serviceBookingId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        timeshift: true,
        status: true,
        isPaid: true,
        totalAmount: true,

        client: {
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
            address: true,
          },
        },

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

        schedules: {
          select: {
            id: true,
            date: true,
            timeshift: true,
            status: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Service booking not found');
    }

    /* ---------------- CALCULATIONS ---------------- */
    const totalVisits = booking.schedules.length;
    const totalPrice = booking.totalAmount

    /* ---------------- RESPONSE ---------------- */
    return {
      serviceBookingId: booking.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      timeShift: booking.timeshift,
      status: booking.status,
      isPaid: booking.isPaid,

      client: {
        id: booking.client.id,
        name: booking.client.user.name,
        email: booking.client.user.email,
        phone: booking.client.user.phone,
        address: booking.client.address,
      },

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
        pricePerVisit: booking.service.price,
        totalVisits,
        totalPrice,
      },

      schedules: booking.schedules.map((schedule) => ({
        id: schedule.id,
        date: schedule.date,
        timeShift: schedule.timeshift,
        status: schedule.status,
      })),
    };
  }

  async getAvailableShifts(
    doulaId: string,
    startDate: string,
    endDate: string,
    visitFrequency: number,
  ) {
    /* ------------------ Validate Doula ------------------ */
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { id: doulaId },
      select: { id: true },
    });

    if (!doula) {
      throw new NotFoundException('Doula not found');
    }

    /* ------------------ Normalize Dates ------------------ */
    const start = this.toUtcMidnight(startDate);
    const end = this.toUtcMidnight(endDate);

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    /* ------------------ Generate Visit Dates ------------------ */
    const visitDates = await generateVisitDatesforPostPartumDoula(
      start,
      end,
      visitFrequency,
    );

    /* ------------------ Check Schedule Conflicts ------------------ */
    const conflictingSchedules = await this.prisma.schedules.findMany({
      where: {
        doulaProfileId: doulaId,
        date: { in: visitDates },
      },
      select: { date: true },
    });

    if (conflictingSchedules.length > 0) {
      const conflictDates = conflictingSchedules.map(
        (s) => s.date.toISOString().split('T')[0],
      );

      throw new BadRequestException(
        `Doula already booked on: ${conflictDates.join(', ')}`,
      );
    }

    /* ------------------ Fetch Availability ------------------ */
    const availabilityRows =
      await this.prisma.availableSlotsForService.findMany({
        where: {
          doulaId,
          date: { in: visitDates },
        },
        select: {
          date: true,
          availability: true,
        },
      });

    /* ------------------ Build Date Map ------------------ */
    const availabilityByDate = new Map<string, any>();

    availabilityRows.forEach((row) => {
      availabilityByDate.set(
        row.date.toISOString().split('T')[0],
        row.availability,
      );
    });

    /* ------------------ Aggregate Shift Availability ------------------ */
    let morningAvailable = true;
    let nightAvailable = true;
    let fulldayAvailable = true;

    for (const date of visitDates) {
      const key = date.toISOString().split('T')[0];
      const availability = availabilityByDate.get(key);

      // If no availability record for a visit date → NOT AVAILABLE
      if (!availability) {
        morningAvailable = false;
        nightAvailable = false;
        fulldayAvailable = false;
        break;
      }

      if (availability.MORNING !== true) morningAvailable = false;
      if (availability.NIGHT !== true) nightAvailable = false;
      if (availability.FULLDAY !== true) fulldayAvailable = false;

      // Early exit optimization
      if (!morningAvailable && !nightAvailable && !fulldayAvailable) {
        break;
      }
    }

    /* ------------------ Response ------------------ */
    return {
      success: true,
      message: 'Available shifts fetched successfully',
      data: {
        doulaId,
        startDate,
        endDate,
        visitFrequency,
        visitDates: visitDates.map((d) =>
          d.toISOString().split('T')[0],
        ),
        availability: {
          MORNING: morningAvailable,
          NIGHT: nightAvailable,
          FULLDAY: fulldayAvailable,
        },
      },
    };
  }



  async getShiftsByDoula(doulaId: string, page = 1, limit = 10) {
    // Validate doula exists
    const doula = await this.prisma.doulaProfile.findUnique({
      where: { id: doulaId },
      select: { id: true },
    });

    if (!doula) {
      throw new NotFoundException('Doula not found');
    }

    const result = await paginate({
      prismaModel: this.prisma.schedules,
      page,
      limit,
      where: {
        doulaProfileId: doulaId,
      },
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

    type ShiftWithRelations = Prisma.SchedulesGetPayload<{
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

    const shifts = result.data as ShiftWithRelations[];

    return {
      success: true,
      message: 'Shifts fetched successfully',
      data: shifts.map((shift) => ({
        shiftId: shift.id,
        date: shift.date,
        timeshift: shift.timeshift,
        status: shift.status,
        serviceName: shift.ServicePricing.service.name,
        clientName: shift.client.user.name,
      })),
      meta: result.meta,
    };
  }

  async getShiftById(shiftId: string) {
    const shift = await this.prisma.schedules.findUnique({
      where: { id: shiftId },
      include: {
        DoulaProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
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

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return {
      success: true,
      message: 'Shift details fetched successfully',
      data: {
        shiftId: shift.id,
        date: shift.date,
        timeshift: shift.timeshift,
        status: shift.status,
        doula: {
          doulaId: shift.DoulaProfile.id,
          name: shift.DoulaProfile.user.name,
        },
        client: shift.client?.user
          ? {
            clientId: shift.client.user.id,
            name: shift.client.user.name,
            email: shift.client.user.email,
          }
          : null,
        service: {
          servicePricingId: shift.ServicePricing.id,
          serviceId: shift.ServicePricing.service.id,
          serviceName: shift.ServicePricing.service.name,
          price: shift.ServicePricing.price,
        },
      },
    };
  }

  private toUtcMidnight(date: Date | string): Date {
    const d = new Date(date);
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
    );
  }

  async calculatePricing(dto: CalculatePricingDto) {
    const {
      doulaProfileId,
      servicePricingId,
      serviceStartDate,
      servicEndDate,
      visitFrequency,
      serviceTimeShift,
      buffer = 0,
    } = dto;

    // Validate doula profile
    const doulaProfile = await this.prisma.doulaProfile.findUnique({
      where: { id: doulaProfileId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            phone: true,
            is_active: true
          },
        },
      },
    });

    if (!doulaProfile) {
      throw new NotFoundException('Doula profile not found');
    }

    // Validate service pricing and get service details
    const servicePricing = await this.prisma.servicePricing.findUnique({
      where: { id: servicePricingId },
      include: {
        service: {
          select: { id: true, name: true },
        },
      },
    });

    if (!servicePricing) {
      throw new NotFoundException('Service pricing not found');
    }

    // Verify the service pricing belongs to the doula
    if (servicePricing.doulaProfileId !== doulaProfileId) {
      throw new BadRequestException(
        'Service pricing does not belong to the specified doula',
      );
    }
    const startDate = this.toUtcMidnight(serviceStartDate);
    const endDate = servicEndDate ? this.toUtcMidnight(servicEndDate) : undefined

    if (endDate && startDate > endDate) {
      throw new BadRequestException('Invalid service date range');
    }

    let visitDates: Date[];

    visitDates =
      servicePricing.service.name === 'Post Partum Doula'
        ? await generateVisitDatesforPostPartumDoula(
          startDate,
          endDate,
          visitFrequency,
        )
        : await generateVisitDatesforBirthDoula(startDate, buffer);


    if (!visitDates.length) {
      throw new BadRequestException('No valid visit dates generated');
    }

    for (const visitDate of visitDates) {
      if (
        !(await isDoulaAvailableForShift(
          doulaProfileId,
          visitDate,
          serviceTimeShift,
        ))
      ) {
        throw new BadRequestException(
          `Doula not available on ${visitDate.toISOString().split('T')[0]}`,
        );
      }

      const existingSchedule = await this.prisma.schedules.findFirst({
        where: {
          doulaProfileId,
          date: visitDate,
          timeshift: serviceTimeShift,
        },
      });

      if (existingSchedule) {
        throw new BadRequestException(
          `Doula already booked on ${visitDate.toISOString().split('T')[0]}`,
        );
      }
    }

    let totalAmount = 0;
    let payableAmount = 0
    if (servicePricing.service.name === 'Birth Doula') {
      const perDayPrice = getPriceForShift(
        servicePricing.price,
        TimeShift.FULLDAY,
      );
      totalAmount = perDayPrice

    } else if (servicePricing.service.name === 'Post Partum Doula') {
      const perDayPrice = getPriceForShift(
        servicePricing.price,
        serviceTimeShift,
      );
      totalAmount = (perDayPrice * visitDates.length)
    }

    console.log("servicename", servicePricing.service.name)
    console.log("totalamount", totalAmount)
    if (totalAmount <= 0) {
      throw new BadRequestException('Invalid total amount');
    }
    payableAmount = totalAmount
    if (totalAmount >= 1000) {
      const half = totalAmount / 2;
      payableAmount = Math.min(half, 1000);
    }
    payableAmount = Math.round(payableAmount * 100) / 100;
    // All dates are available, return pricing
    return {
      success: true,
      message: 'Pricing calculated successfully',
      data: {
        available: true,
        doulaProfileId,
        servicePricingId,
        serviceName: servicePricing.service.name,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
        visitDates: visitDates.map((date) => date.toISOString().split('T')[0]),
        numberOfVisits: visitDates.length,
        timeShift: serviceTimeShift,
        pricePerVisit:
          servicePricing.service.name === 'Birth Doula'
            ? totalAmount
            : getPriceForShift(servicePricing.price, serviceTimeShift),
        totalAmount,
        payableAmount,
        currency: 'USD',
        priceBreakdown: servicePricing.price,
      },
    };
  }
}
