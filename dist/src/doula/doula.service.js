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
let DoulaService = class DoulaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId, images = []) {
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
                                Region: {
                                    connect: dto.regionIds.map((id) => ({ id })),
                                },
                                zoneManager: {
                                    connect: { id: manager.id },
                                },
                                DoulaImages: {
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
                                Region: {
                                    connect: dto.regionIds.map((id) => ({ id })),
                                },
                                zoneManager: {
                                    connect: zoneManagerIds.map((id) => ({ id })),
                                },
                                DoulaImages: {
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
            if (dto.services) {
                await Promise.all(Object.entries(dto.services).map(([serviceId, price]) => tx.servicePricing.create({
                    data: {
                        doulaProfileId: createdUser.doulaProfile.id,
                        serviceId,
                        price,
                    },
                })));
            }
            const doulaWithDetails = await tx.user.findUnique({
                where: { id: createdUser.id },
                include: {
                    doulaProfile: {
                        include: {
                            DoulaImages: {
                                orderBy: { sortOrder: 'asc' },
                            },
                            ServicePricing: {
                                include: { service: true },
                            },
                            Region: true,
                            zoneManager: true,
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
        let servicePricingConditions = {};
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
                        DoulaImages: true
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
            const services = profile.ServicePricing?.map(p => p.service?.name).filter(Boolean) ??
                [];
            const regions = profile.Region?.map(r => r.regionName).filter(Boolean) ?? [];
            const testimonials = profile.Testimonials ?? [];
            const reviewCount = testimonials.length;
            const avgRating = reviewCount > 0
                ? testimonials.reduce((s, t) => s + t.ratings, 0) / reviewCount
                : null;
            const available = rangeStart && rangeEnd
                ? bookedDates.length === 0
                : null;
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
                serviceNames: services,
                regionNames: regions,
                ratings: avgRating,
                reviewsCount: reviewCount,
                isAvailable: available,
                nextImmediateAvailabilityDate: bookedDates.length ? bookedDates[0] : null,
                images: profile.DoulaImages?.map(img => ({
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
                        DoulaImages: true,
                    },
                },
            },
        });
        if (!doula || doula.role !== client_1.Role.DOULA) {
            throw new common_1.NotFoundException('Doula not found');
        }
        const profile = doula.doulaProfile;
        const services = profile?.ServicePricing
            ?.map(p => p.service?.name)
            .filter(Boolean) ?? [];
        const regions = profile?.Region
            ?.map(r => r.regionName)
            .filter(Boolean) ?? [];
        const testimonials = profile?.Testimonials ?? [];
        const reviewsCount = testimonials.length;
        const avgRating = reviewsCount > 0
            ? testimonials.reduce((sum, t) => sum + t.ratings, 0) / reviewsCount
            : null;
        const today = new Date();
        const todayIndex = today.getDay();
        const weekdayOrder = {
            SUNDAY: 0,
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
        };
        const availableWeekdays = profile?.AvailableSlotsForService?.map(s => weekdayOrder[s.weekday]) ?? [];
        const nextImmediateAvailabilityDate = availableWeekdays.length > 0
            ? new Date(today.setDate(today.getDate() +
                Math.min(...availableWeekdays.map(d => d >= todayIndex ? d - todayIndex : 7 - todayIndex + d))))
            : null;
        const transformed = {
            userId: doula.id,
            name: doula.name,
            email: doula.email,
            profileId: profile?.id ?? null,
            yoe: profile?.yoe ?? null,
            description: profile?.description ?? null,
            achievements: profile?.achievements ?? null,
            qualification: profile?.qualification ?? null,
            serviceNames: services,
            regionNames: regions,
            ratings: avgRating,
            reviewsCount,
            nextImmediateAvailabilityDate,
            images: profile?.DoulaImages?.map(img => ({
                id: img.id,
                url: img.url,
                isPrimary: img.isMain ?? false,
                createdAt: img.createdAt,
            })) ?? [],
            testimonials: testimonials.map(t => ({
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
            include: { doulaProfile: true }
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
            throw new common_1.NotFoundException("Doula does not exist");
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
            select: { id: true, zoneManager: { select: { id: true } } }
        });
        if (regions.length !== dto.regionIds.length)
            throw new common_1.NotFoundException("One or more region IDs are invalid");
        if (user?.role === client_1.Role.ZONE_MANAGER) {
            const zn = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId }
            });
            if (!zn)
                throw new common_1.NotFoundException("Zone Manager profile not found");
            const unauthorized = regions.some(r => r.zoneManager?.id !== zn.id);
            if (unauthorized) {
                throw new common_1.BadRequestException("You cannot assign regions that are not managed by you.");
            }
            const update = await this.prisma.doulaProfile.update({
                where: { id: dto.profileId },
                data: {
                    Region: {
                        [dto.purpose === "add" ? "connect" : "disconnect"]: dto.regionIds.map(id => ({ id })),
                    },
                    ...(dto.purpose === "add"
                        ? { zoneManager: { connect: { id: zn.id } } }
                        : {}),
                },
                include: { Region: true, zoneManager: true },
            });
            return {
                message: `Regions ${dto.purpose === "add" ? "added" : "removed"} successfully`,
                data: update,
            };
        }
        if (user?.role === client_1.Role.ADMIN) {
            if (dto.purpose === "add") {
                const zoneManagerIds = regions
                    .map(r => r.zoneManager?.id)
                    .filter(id => id);
                if (zoneManagerIds.length !== regions.length)
                    throw new common_1.BadRequestException("All selected regions must have a Zone Manager assigned");
                const update = await this.prisma.doulaProfile.update({
                    where: { id: dto.profileId },
                    data: {
                        Region: {
                            connect: dto.regionIds.map(id => ({ id }))
                        },
                        zoneManager: {
                            connect: zoneManagerIds.map(id => ({ id }))
                        }
                    },
                    include: { Region: true, zoneManager: true },
                });
                return { message: "Regions added successfully", data: update };
            }
            if (dto.purpose === "remove") {
                const update = await this.prisma.doulaProfile.update({
                    where: { id: dto.profileId },
                    data: {
                        Region: {
                            disconnect: dto.regionIds.map(id => ({ id }))
                        }
                    },
                    include: { Region: true, zoneManager: true },
                });
                return { message: "Regions removed successfully", data: update };
            }
        }
        throw new common_1.BadRequestException("Invalid purpose");
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
                date: meeting.date,
                serviceName: meeting.serviceName,
                clientName: meeting.bookedBy.user.name,
            })),
            meta: result.meta,
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
                date: schedule.date,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                serviceName: schedule.ServicePricing.service.name,
                clientName: schedule.client.user.name,
            })),
            meta: result.meta,
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
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' },
            ],
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
            },
        });
        if (!doula) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const totalReviews = doula.Testimonials.length;
        const ratingSum = doula.Testimonials.reduce((sum, r) => sum + r.ratings, 0);
        const averageRating = totalReviews > 0
            ? Number((ratingSum / totalReviews).toFixed(1))
            : 0;
        const satisfaction = totalReviews > 0
            ? Math.round((ratingSum / (totalReviews * 5)) * 100)
            : 0;
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
                certifications: [
                    ...(doula.qualification
                        ? doula.qualification.split(',').map((q) => q.trim())
                        : []),
                    ...(doula.achievements
                        ? doula.achievements.split(',').map((a) => a.trim())
                        : []),
                ],
                gallery: doula.DoulaGallery.map((img) => ({
                    id: img.id,
                    url: img.url,
                    altText: img.altText,
                })),
            },
        };
    }
    async addDoulaprofileImage(userId, file, isMain = false, sortOrder = 0, altText) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const imageUrl = `/uploads/doula/${file.filename}`;
        return this.prisma.$transaction(async (tx) => {
            if (isMain) {
                await tx.doulaImages.updateMany({
                    where: {
                        doulaProfileId: doulaProfile.id,
                        isMain: true,
                    },
                    data: { isMain: false },
                });
            }
            const image = await tx.doulaImages.create({
                data: {
                    doulaProfileId: doulaProfile.id,
                    url: imageUrl,
                    altText,
                    isMain,
                    sortOrder,
                },
            });
            return {
                message: 'Image uploaded successfully',
                data: image,
            };
        });
    }
    async getDoulaImages(userId) {
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const images = await this.prisma.doulaImages.findMany({
            where: {
                doulaProfileId: doulaProfile.id,
            },
            orderBy: [
                { isMain: 'desc' },
                { sortOrder: 'asc' },
            ],
        });
        return {
            status: 'success',
            message: 'Doula images fetched successfully',
            data: images,
        };
    }
    async deleteDoulaprofileImage(userId, imageId) {
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const image = await this.prisma.doulaImages.findUnique({
            where: { id: imageId },
        });
        if (!image || image.doulaProfileId !== doulaProfile.id) {
            throw new common_1.NotFoundException('Image not found');
        }
        await this.prisma.doulaImages.delete({
            where: { id: imageId },
        });
        return { message: 'Image deleted successfully' };
    }
    async addDoulaGalleryImage(userId, file, altText) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doulaProfile) {
            throw new common_1.NotFoundException('Doula profile not found');
        }
        const imageUrl = `uploads/doulas/${file.filename}`;
        const image = await this.prisma.doulaGallery.create({
            data: {
                doulaProfileId: doulaProfile.id,
                url: imageUrl,
                altText,
            },
        });
        return {
            message: 'Gallery image uploaded successfully',
            data: image,
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
};
exports.DoulaService = DoulaService;
exports.DoulaService = DoulaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoulaService);
//# sourceMappingURL=doula.service.js.map