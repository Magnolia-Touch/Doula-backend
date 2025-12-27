"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoulaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const pagination_util_1 = require("../common/utility/pagination.util");
const paginate_with_relations_util_1 = require("../common/utility/paginate-with-relations.util");
const MAX_GALLERY_IMAGES = 5;
let DoulaService = class DoulaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId, images = [], profileImageUrl) {
        console.log('loggg', dto.certificates);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });
        if (regions.length !== dto.regionIds.length) {
            throw new common_1.NotFoundException('One or more region IDs are invalid');
        }
        return await this.prisma.$transaction(async (tx) => {
            let createdUser;
            if (user.role === client_1.Role.ZONE_MANAGER) {
                const manager = await tx.zoneManagerProfile.findUnique({
                    where: { userId },
                });
                if (!manager) {
                    throw new common_1.BadRequestException('Zone Manager profile not found');
                }
                createdUser = await tx.user.create({
                    data: {
                        name: dto.name,
                        email: dto.email,
                        phone: dto.phone,
                        role: client_1.Role.DOULA,
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
            if (user.role === client_1.Role.ADMIN) {
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
                    .map((r) => r.zoneManager.id);
                if (!zoneManagerIds.length) {
                    throw new common_1.BadRequestException('Selected regions must have Zone Managers assigned');
                }
                createdUser = await tx.user.create({
                    data: {
                        name: dto.name,
                        email: dto.email,
                        phone: dto.phone,
                        role: client_1.Role.DOULA,
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
                throw new common_1.BadRequestException('Unauthorized role');
            }
            const certificates = dto.parsedCertificates;
            if (certificates.length) {
                await tx.certificates.createMany({
                    data: certificates.map((cert) => ({
                        name: cert.name,
                        issuedBy: cert.issuedBy ?? 'Unknown',
                        year: cert.year ?? '0000',
                        doulaProfileId: createdUser.doulaProfile.id,
                    })),
                });
            }
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
    async get(page = 1, limit = 10, search, serviceId, isAvailable, isActive, regionName, minExperience, serviceName, startDate, endDate) {
        const where = {
            role: client_1.Role.DOULA,
        };
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
        if (regionName) {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                Region: {
                    some: { regionName: { contains: regionName.toLowerCase() } },
                },
            };
        }
        if (typeof minExperience === 'number') {
            where.doulaProfile = {
                ...(where.doulaProfile || {}),
                yoe: { gte: minExperience },
            };
        }
        const servicePricingConditions = {};
        if (serviceId)
            servicePricingConditions.serviceId = serviceId;
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
        if (typeof isActive === 'boolean') {
            where.is_active = isActive;
        }
        const result = await (0, pagination_util_1.paginate)({
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
                        Certificates: true
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
        const rangeStart = startDate ? new Date(startDate) : null;
        const rangeEnd = endDate ? new Date(endDate) : null;
        if (rangeStart)
            rangeStart.setHours(0, 0, 0, 0);
        if (rangeEnd)
            rangeEnd.setHours(0, 0, 0, 0);
        const doulaProfileIds = users
            .map((u) => u.doulaProfile?.id)
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
        const scheduleMap = new Map();
        for (const s of schedules) {
            if (!scheduleMap.has(s.doulaProfileId)) {
                scheduleMap.set(s.doulaProfileId, []);
            }
            scheduleMap.get(s.doulaProfileId).push(s.date);
        }
        const transformed = users
            .map((user) => {
            const profile = user.doulaProfile;
            if (!profile)
                return null;
            const bookedDates = scheduleMap.get(profile.id) ?? [];
            const services = profile.ServicePricing?.map((p) => {
                if (!p.service)
                    return null;
                return {
                    servicePricingId: p.id,
                    serviceId: p.service.id,
                    serviceName: p.service.name,
                    price: p.price,
                };
            }).filter(Boolean) ?? [];
            const regions = profile.Region?.map((r) => ({
                id: r.id,
                name: r.regionName,
            })) ?? [];
            const testimonials = profile.Testimonials ?? [];
            const reviewCount = testimonials.length;
            const avgRating = reviewCount > 0
                ? testimonials.reduce((s, t) => s + t.ratings, 0) / reviewCount
                : null;
            const available = rangeStart && rangeEnd ? bookedDates.length === 0 : null;
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
                images: profile.DoulaGallery?.map((img) => ({
                    id: img.id,
                    url: img.url,
                    isPrimary: img.isPrimary ?? false,
                })) ?? [],
                certificates: profile.Certificates?.map((cert) => ({
                    id: cert.id,
                    name: cert.name,
                    issuedBy: cert.issuedBy,
                    year: cert.year
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
    async getById(id) {
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
                        Certificates: true
                    },
                },
            },
        });
        if (!doula || doula.role !== client_1.Role.DOULA) {
            throw new common_1.NotFoundException('Doula not found');
        }
        const profile = doula.doulaProfile;
        const services = profile?.ServicePricing?.map((p) => {
            if (!p.service)
                return null;
            return {
                servicePricingId: p.id,
                serviceId: p.service.id,
                serviceName: p.service.name,
                price: p.price,
            };
        }).filter(Boolean) ?? [];
        const regions = profile?.Region?.map((r) => ({
            id: r.id,
            name: r.regionName,
        })) ?? [];
        const testimonials = profile?.Testimonials ?? [];
        const reviewsCount = testimonials.length;
        const avgRating = reviewsCount > 0
            ? testimonials.reduce((sum, t) => sum + t.ratings, 0) / reviewsCount
            : null;
        const nextSchedule = await this.prisma.schedules.findFirst({
            where: {
                doulaProfileId: profile?.id,
                date: { gte: new Date() },
            },
            orderBy: { date: 'asc' },
            select: { date: true },
        });
        const nextImmediateAvailabilityDate = nextSchedule?.date ?? null;
        const transformed = {
            userId: doula.id,
            name: doula.name,
            email: doula.email,
            profileId: profile?.id ?? null,
            yoe: profile?.yoe ?? null,
            specialities: profile?.specialities,
            description: profile?.description ?? null,
            qualification: profile?.qualification ?? null,
            profileImage: profile?.profile_image ?? null,
            serviceNames: services,
            regionNames: regions,
            ratings: avgRating,
            reviewsCount,
            nextImmediateAvailabilityDate,
            galleryImages: profile?.DoulaGallery?.map((img) => ({
                id: img.id,
                url: img.url,
                createdAt: img.createdAt,
            })) ?? [],
            certificates: profile?.Certificates?.map((cert) => ({
                id: cert.id,
                name: cert.name,
                issuedBy: cert.issuedBy,
                year: cert.year
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
    async delete(id) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
            include: { doulaProfile: true },
        });
        if (!existingUser || existingUser.role !== client_1.Role.DOULA) {
            throw new common_1.NotFoundException('Doula not found');
        }
        if (existingUser.doulaProfile) {
            await this.prisma.doulaProfile.delete({
                where: { userId: existingUser.id },
            });
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'Doula deleted successfully', data: null };
    }
    async updateStatus(id, isActive) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== client_1.Role.DOULA) {
            throw new common_1.NotFoundException('Doula not found');
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                is_active: isActive,
            },
        });
        return { message: 'Doula status updated successfully', data: updated };
    }
    async UpdateDoulaRegions(dto, userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { id: dto.profileId },
            include: { zoneManager: true, Region: true },
        });
        if (!doula)
            throw new common_1.NotFoundException('Doula does not exist');
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
            select: { id: true, zoneManager: { select: { id: true } } },
        });
        if (regions.length !== dto.regionIds.length)
            throw new common_1.NotFoundException('One or more region IDs are invalid');
        if (user?.role === client_1.Role.ZONE_MANAGER) {
            const zn = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId },
            });
            if (!zn)
                throw new common_1.NotFoundException('Zone Manager profile not found');
            const unauthorized = regions.some((r) => r.zoneManager?.id !== zn.id);
            if (unauthorized) {
                throw new common_1.BadRequestException('You cannot assign regions that are not managed by you.');
            }
            const update = await this.prisma.doulaProfile.update({
                where: { id: dto.profileId },
                data: {
                    Region: {
                        [dto.purpose === 'add' ? 'connect' : 'disconnect']: dto.regionIds.map((id) => ({ id })),
                    },
                    ...(dto.purpose === 'add'
                        ? { zoneManager: { connect: { id: zn.id } } }
                        : {}),
                },
                include: { Region: true, zoneManager: true },
            });
            return {
                message: `Regions ${dto.purpose === 'add' ? 'added' : 'removed'} successfully`,
                data: update,
            };
        }
        if (user?.role === client_1.Role.ADMIN) {
            if (dto.purpose === 'add') {
                const zoneManagerIds = regions
                    .map((r) => r.zoneManager?.id)
                    .filter((id) => id);
                if (zoneManagerIds.length !== regions.length)
                    throw new common_1.BadRequestException('All selected regions must have a Zone Manager assigned');
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
        throw new common_1.BadRequestException('Invalid purpose');
    }
    async getDoulaMeetings(user, page = 1, limit = 10, date) {
        if (user.role !== client_1.Role.DOULA) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const where = {
            doulaProfileId: doulaProfile.id,
        };
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
        const result = await (0, pagination_util_1.paginate)({
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
        const meetings = result.data;
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
    async getDoulaMeetingDetail(user, meetingId) {
        if (user.role !== client_1.Role.DOULA) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
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
            throw new common_1.NotFoundException('Meeting not found');
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
    async getDoulaSchedules(user, page = 1, limit = 10, date) {
        if (user.role !== client_1.Role.DOULA) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const where = {
            doulaProfileId: doulaProfile.id,
        };
        if (date) {
            where.date = new Date(date);
        }
        const result = await (0, pagination_util_1.paginate)({
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
        const schedules = result.data;
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
                status: schedule.status,
            })),
            meta: result.meta,
        };
    }
    async getDoulaScheduleDetail(user, scheduleId) {
        if (user.role !== client_1.Role.DOULA) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
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
            throw new common_1.NotFoundException('Schedule not found');
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
    async getDoulaScheduleCount(user) {
        if (user.role !== client_1.Role.DOULA) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const [todayCount, weeklyCount] = await Promise.all([
            this.prisma.schedules.count({
                where: {
                    doulaProfileId: doulaProfile.id,
                    date: today,
                },
            }),
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
    async ImmediateMeeting(user) {
        if (user.role !== client_1.Role.DOULA) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const now = new Date();
        const meeting = await this.prisma.meetings.findFirst({
            where: {
                doulaProfileId: doulaProfile.id,
                status: client_1.MeetingStatus.SCHEDULED,
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
        const meetingDateTime = new Date(meeting.date);
        meetingDateTime.setHours(meeting.startTime.getHours(), meeting.startTime.getMinutes(), 0, 0);
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
    async getDoulaRatingSummary(user) {
        if (user.role !== client_1.Role.DOULA) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
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
    async getDoulaTestimonials(user, page = 1, limit = 10) {
        if (user.role !== client_1.Role.DOULA) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const result = await (0, pagination_util_1.paginate)({
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
        const testimonials = result.data;
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
    async doulaProfile(user) {
        if (user.role !== client_1.Role.DOULA) {
            throw new common_1.ForbiddenException('Access denied');
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
                Certificates: { select: { id: true, issuedBy: true, name: true, year: true } },
                ServicePricing: { include: { service: true } }
            },
        });
        if (!doula) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const totalReviews = doula.Testimonials.length;
        const ratingSum = doula.Testimonials.reduce((sum, r) => sum + r.ratings, 0);
        const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0;
        const satisfaction = totalReviews > 0 ? Math.round((ratingSum / (totalReviews * 5)) * 100) : 0;
        return {
            success: true,
            message: 'Doula profile fetched successfully',
            data: {
                id: doula.id,
                name: doula.user.name,
                title: 'Certified Birth Doula',
                averageRating,
                totalReviews,
                births: 0,
                experience: doula.yoe ?? 0,
                satisfaction,
                contact: {
                    email: doula.user.email,
                    phone: doula.user.phone,
                    location: doula.Region?.[0]?.regionName ?? null,
                },
                about: doula.description,
                servicePricing: doula.ServicePricing.map((pricing) => ({
                    servicePricingid: pricing.id,
                    servicename: pricing.service.name,
                    price: pricing.price
                })),
                certificates: doula.Certificates.map((cert) => ({
                    id: cert.id,
                    name: cert.name,
                    issuedBy: cert.issuedBy,
                    year: cert.year
                })),
                gallery: doula.DoulaGallery.map((img) => ({
                    id: img.id,
                    url: img.url,
                    altText: img.altText,
                })),
            },
        };
    }
    async addDoulaprofileImage(userId, profileImageUrl) {
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
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
    async getDoulaImages(userId) {
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
            select: { id: true, profile_image: true },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
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
    async deleteDoulaprofileImage(userId) {
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const image = await this.prisma.doulaProfile.update({
            where: { userId: userId },
            data: { profile_image: null },
        });
        return { message: 'Image deleted successfully' };
    }
    async addDoulaGalleryImages(userId, files, altText) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('At least one image is required');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
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
    async getDoulaGalleryImages(userId) {
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
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
    async deleteDoulaGalleryImage(userId, imageId) {
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const image = await this.prisma.doulaGallery.findUnique({
            where: { id: imageId },
        });
        if (!image || image.doulaProfileId !== doulaProfile.id) {
            throw new common_1.NotFoundException('Image not found');
        }
        await this.prisma.doulaGallery.delete({
            where: { id: imageId },
        });
        return {
            message: 'Gallery image deleted successfully',
        };
    }
    async updateDoulaProfile(userId, dto) {
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const { name, is_active, description, achievements, qualification, yoe, languages, specialities, certificates, servicePricings, } = dto;
        const operations = [];
        if (name !== undefined || is_active !== undefined) {
            operations.push(this.prisma.user.update({
                where: { id: userId },
                data: {
                    ...(name !== undefined && { name }),
                    ...(is_active !== undefined && { is_active }),
                },
            }));
        }
        const toJsonPrice = (price) => ({
            morning: price.morning,
            night: price.night,
            fullday: price.fullday,
        });
        if (servicePricings?.length) {
            for (const pricing of servicePricings) {
                operations.push(this.prisma.servicePricing.updateMany({
                    where: {
                        id: pricing.servicePricingId,
                        doulaProfileId: doulaProfile.id,
                    },
                    data: {
                        price: toJsonPrice(pricing.price),
                    },
                }));
            }
        }
        operations.push(this.prisma.doulaProfile.update({
            where: { userId },
            data: {
                ...(description !== undefined && { description }),
                ...(achievements !== undefined && { achievements }),
                ...(qualification !== undefined && { qualification }),
                ...(yoe !== undefined && { yoe }),
                ...(languages !== undefined && { languages }),
                ...(specialities !== undefined && { specialities }),
            },
        }));
        if (certificates?.length) {
            for (const cert of certificates) {
                operations.push(this.prisma.certificates.updateMany({
                    where: {
                        id: cert.certificateId,
                        doulaProfileId: doulaProfile.id,
                    },
                    data: {
                        ...(cert.data.name !== undefined && { name: cert.data.name }),
                        ...(cert.data.issuedBy !== undefined && {
                            issuedBy: cert.data.issuedBy,
                        }),
                        ...(cert.data.year !== undefined && { year: cert.data.year }),
                    },
                }));
            }
        }
        await this.prisma.$transaction(operations);
        return {
            message: 'Doula profile updated successfully',
        };
    }
    async getDoulaProfile(userId) {
        const profile = await this.prisma.doulaProfile.findUnique({
            where: { userId: userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        return profile;
    }
    async getCertificates(userId) {
        const doulaProfile = await this.getDoulaProfile(userId);
        console.log('dola, ', doulaProfile);
        return this.prisma.certificates.findMany({
            where: { doulaProfileId: doulaProfile.id },
            orderBy: { year: 'desc' },
        });
    }
    async getCertificateById(userId, certificateId) {
        const doulaProfile = await this.getDoulaProfile(userId);
        const certificate = await this.prisma.certificates.findFirst({
            where: {
                id: certificateId,
                doulaProfileId: doulaProfile.id,
            },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        return certificate;
    }
    async updateCertificate(userId, certificateId, dto) {
        const doulaProfile = await this.getDoulaProfile(userId);
        const certificate = await this.prisma.certificates.findFirst({
            where: {
                id: certificateId,
                doulaProfileId: doulaProfile.id,
            },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
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
    async deleteCertificate(userId, certificateId) {
        const doulaProfile = await this.getDoulaProfile(userId);
        const certificate = await this.prisma.certificates.findFirst({
            where: {
                id: certificateId,
                doulaProfileId: doulaProfile.id,
            },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        await this.prisma.certificates.delete({
            where: { id: certificateId },
        });
        return {
            message: 'Certificate deleted successfully',
        };
    }
    async getServiceBookings(userId, page = 1, limit = 10) {
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
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const result = await (0, paginate_with_relations_util_1.paginateWithRelations)({
            page,
            limit,
            query: () => this.prisma.serviceBooking.findMany({
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
            countQuery: () => this.prisma.serviceBooking.count({
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
    async getServiceBookingsinDetail(userId, serviceBookingId) {
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
            throw new common_1.NotFoundException('Doula profile not found');
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
            throw new common_1.NotFoundException('Service booking not found');
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
};
exports.DoulaService = DoulaService;
exports.DoulaService = DoulaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoulaService);
//# sourceMappingURL=doula.service.js.map