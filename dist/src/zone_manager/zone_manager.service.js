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
exports.ZoneManagerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const pagination_util_1 = require("../common/utility/pagination.util");
const service_utils_1 = require("../common/utility/service-utils");
let ZoneManagerService = class ZoneManagerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, profileImageUrl) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        console.log('regionIds', dto.regionIds);
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });
        if (regions.length != dto.regionIds.length) {
            throw new common_1.NotFoundException('One or more region IDs are invalid');
        }
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const zoneManager = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: client_1.Role.ZONE_MANAGER,
                zonemanagerprofile: {
                    create: {
                        managingRegion: {
                            connect: dto.regionIds.map((id) => ({ id })),
                        },
                        profile_image: profileImageUrl ?? null,
                    },
                },
            },
            include: { zonemanagerprofile: true },
        });
        return { message: 'Zone Manager created successfully', data: zoneManager };
    }
    async get(page = 1, limit = 10, search) {
        const where = {
            role: client_1.Role.ZONE_MANAGER,
            OR: search
                ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    {
                        zonemanagerprofile: {
                            managingRegion: {
                                some: {
                                    regionName: {
                                        contains: search.toLowerCase(),
                                    },
                                },
                            },
                        },
                    },
                ]
                : undefined,
        };
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.user,
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                zonemanagerprofile: {
                    include: {
                        managingRegion: {
                            select: { regionName: true },
                        },
                        doulas: {
                            include: {
                                user: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        const data = result.data.map((user) => ({
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            is_active: user.is_active,
            profileId: user.zonemanagerprofile?.id ?? null,
            regions: user.zonemanagerprofile?.managingRegion.map((r) => r.regionName) ??
                [],
            doulas: user.zonemanagerprofile?.doulas
                .map((d) => d.user?.name)
                .filter(Boolean) ?? [],
        }));
        return {
            message: 'Zone Managers fetched successfully',
            data,
            meta: result.meta,
        };
    }
    async getById(id) {
        const zoneManager = await this.prisma.user.findUnique({
            where: { id },
            include: {
                zonemanagerprofile: {
                    include: {
                        managingRegion: true,
                        doulas: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        phone: true,
                                        is_active: true,
                                    },
                                },
                                Region: true,
                            },
                        },
                    },
                },
            },
        });
        if (!zoneManager || zoneManager.role !== client_1.Role.ZONE_MANAGER) {
            throw new common_1.NotFoundException('Zone Manager not found');
        }
        const profile = zoneManager.zonemanagerprofile;
        const response = {
            userId: zoneManager.id,
            name: zoneManager.name,
            email: zoneManager.email,
            phone: zoneManager.phone,
            role: zoneManager.role,
            is_active: zoneManager.is_active,
            profileId: profile?.id ?? null,
            regions: profile?.managingRegion.map((region) => ({
                id: region.id,
                regionName: region.regionName,
                pincode: region.pincode,
                district: region.district,
                state: region.state,
                country: region.country,
                latitude: region.latitude,
                longitude: region.longitude,
                is_active: region.is_active,
            })) ?? [],
            doulas: profile?.doulas.map((doula) => ({
                doulaProfileId: doula.id,
                userId: doula.user.id,
                name: doula.user.name,
                email: doula.user.email,
                phone: doula.user.phone,
                is_active: doula.user.is_active,
                description: doula.description,
                qualification: doula.qualification,
                achievements: doula.achievements,
                yoe: doula.yoe,
                languages: doula.languages,
                regions: doula.Region.map((region) => ({
                    id: region.id,
                    regionName: region.regionName,
                    pincode: region.pincode,
                    district: region.district,
                    state: region.state,
                    country: region.country,
                })),
            })) ?? [],
        };
        return {
            message: 'Zone Manager fetched successfully',
            data: response,
        };
    }
    async delete(id) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== client_1.Role.ZONE_MANAGER) {
            throw new common_1.NotFoundException('Zone Manager not found');
        }
        await this.prisma.user.delete({ where: { id } });
        return { message: 'Zone Manager deleted successfully', data: null };
    }
    async updateStatus(id, isActive) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing || existing.role !== client_1.Role.ZONE_MANAGER) {
            throw new common_1.NotFoundException('Zone Manager not found');
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                is_active: isActive,
            },
        });
        return {
            message: 'Zone Manager status updated successfully',
            data: updated,
        };
    }
    async UpdateZoneManagerRegions(dto) {
        const a = (0, service_utils_1.findZoneManagerOrThrowWithId)(this.prisma, dto.profileId);
        console.log(a);
        const regions = await this.prisma.region.findMany({
            where: { id: { in: dto.regionIds } },
        });
        if (regions.length != dto.regionIds.length) {
            throw new common_1.NotFoundException('One or more region IDs are invalid');
        }
        if (dto.purpose == 'add') {
            const data = await this.prisma.region.updateMany({
                where: { id: { in: dto.regionIds } },
                data: { zoneManagerId: dto.profileId },
            });
            return {
                message: `${data.count} Region(s) successfully assigned to Manager`,
            };
        }
        else if (dto.purpose == 'remove') {
            const data = await this.prisma.region.updateMany({
                where: { id: { in: dto.regionIds } },
                data: { zoneManagerId: null },
            });
            return {
                message: `${data.count} Region(s) successfully removed from Manager`,
            };
        }
    }
    async regionAlreadyAssignedOrNot(regionIds) {
        const regions = await this.prisma.region.findMany({
            where: { id: { in: regionIds } },
            select: { id: true, regionName: true, zoneManagerId: true },
        });
        if (regions.length !== regionIds.length) {
            throw new common_1.NotFoundException('One or more region IDs are invalid');
        }
        const assigned = regions.filter((r) => r.zoneManagerId !== null);
        const unassigned = regions.filter((r) => r.zoneManagerId === null);
        return {
            message: 'Region assignment status fetched',
            assignedCount: assigned.length,
            unassignedCount: unassigned.length,
            assigned,
            unassigned,
        };
    }
    async getZoneManagerSchedules(userId, page = 1, limit = 10, filters) {
        console.log('user', userId);
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId: userId },
            select: { id: true },
        });
        if (!zoneManager) {
            throw new common_1.ForbiddenException('Zone manager profile not found');
        }
        const where = {
            DoulaProfile: {
                zoneManager: {
                    some: {
                        id: zoneManager.id,
                    },
                },
            },
        };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.date) {
            where.date = new Date(filters.date);
        }
        if (filters?.serviceName) {
            where.ServicePricing = {
                service: {
                    name: {
                        contains: filters.serviceName.toLowerCase(),
                    },
                },
            };
        }
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.schedules,
            page,
            limit,
            where,
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
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
                                name: true,
                            },
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
            message: 'Schedules fetched successfully',
            data: schedules.map((schedule) => {
                const durationMs = schedule.endTime.getTime() - schedule.startTime.getTime();
                const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                const durationMinutes = (durationMs % (1000 * 60 * 60)) / (1000 * 60);
                return {
                    scheduleId: schedule.id,
                    clientId: schedule.client.id,
                    clientName: schedule.client.user.name,
                    doulaId: schedule.DoulaProfile.id,
                    doulaName: schedule.DoulaProfile.user.name,
                    serviceName: schedule.ServicePricing.service.name,
                    startDate: schedule.startTime,
                    endDate: schedule.endTime,
                    duration: `${durationHours}h ${durationMinutes}m`,
                    status: schedule.status,
                };
            }),
            meta: result.meta,
        };
    }
    async getZoneManagerBookedServices(userId, page = 1, limit = 10, filters) {
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId: userId },
            select: { id: true },
        });
        if (!zoneManager) {
            throw new common_1.ForbiddenException('Zone manager profile not found');
        }
        const where = {
            DoulaProfile: {
                zoneManager: {
                    some: {
                        id: zoneManager.id,
                    },
                },
            },
        };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.startDate || filters?.endDate) {
            where.AND = [];
            if (filters.startDate) {
                where.AND.push({
                    endDate: {
                        gte: new Date(filters.startDate),
                    },
                });
            }
            if (filters.endDate) {
                where.AND.push({
                    startDate: {
                        lte: new Date(filters.endDate),
                    },
                });
            }
        }
        if (filters?.serviceName) {
            where.service = {
                service: {
                    name: {
                        contains: filters.serviceName.toLowerCase(),
                    },
                },
            };
        }
        const result = await (0, pagination_util_1.paginate)({
            prismaModel: this.prisma.serviceBooking,
            page,
            limit,
            where,
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
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
                service: {
                    include: {
                        service: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                startDate: 'desc',
            },
        });
        const bookings = result.data;
        return {
            success: true,
            message: 'Booked services fetched successfully',
            data: bookings.map((booking) => ({
                bookingId: booking.id,
                clientId: booking.client.id,
                clientName: booking.client.user.name,
                doulaId: booking.DoulaProfile.id,
                doulaName: booking.DoulaProfile.user.name,
                servicePricingId: booking.service.id,
                serviceName: booking.service.service.name,
                startDate: booking.startDate,
                endDate: booking.endDate,
                status: booking.status,
            })),
            meta: result.meta,
        };
    }
    async getZoneManagerMeetings(userId, page = 1, limit = 10, search, status) {
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId: userId },
            select: { id: true },
        });
        if (!zoneManager) {
            throw new common_1.ForbiddenException('Zone manager profile not found');
        }
        const doulas = await this.prisma.doulaProfile.findMany({
            where: {
                zoneManager: {
                    some: {
                        id: zoneManager.id,
                    },
                },
            },
            select: { id: true },
        });
        const doulaIds = doulas.map((d) => d.id);
        const where = {
            OR: [
                { zoneManagerProfileId: zoneManager.id },
                { doulaProfileId: { in: doulaIds } },
            ],
        };
        where.AND = [];
        if (search) {
            where.AND.push({
                OR: [
                    {
                        bookedBy: {
                            user: {
                                name: {
                                    contains: search.toLowerCase(),
                                },
                            },
                        },
                    },
                    {
                        Service: {
                            name: {
                                contains: search.toLowerCase(),
                            },
                        },
                    },
                    {
                        serviceName: {
                            contains: search.toLowerCase(),
                        },
                    },
                ],
            });
        }
        if (status) {
            where.AND.push({
                status: status,
            });
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
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
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
                Service: {
                    select: {
                        id: true,
                        name: true,
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
            message: 'Zone manager meetings fetched successfully',
            data: meetings.map((meeting) => ({
                meetingId: meeting.id,
                clientId: meeting.bookedBy.id,
                clientName: meeting.bookedBy.user.name,
                doulaId: meeting.DoulaProfile?.id ?? null,
                doulaName: meeting.DoulaProfile?.user.name ?? null,
                servicePricingId: meeting.serviceId ?? null,
                serviceName: meeting.Service?.name ?? meeting.serviceName,
                startDate: meeting.startTime,
                endDate: meeting.endTime,
                status: meeting.status,
            })),
            meta: result.meta,
        };
    }
    async getZoneManagerScheduleById(userId, scheduleId) {
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!zoneManager) {
            throw new common_1.ForbiddenException('Zone manager profile not found');
        }
        const schedule = await this.prisma.schedules.findFirst({
            where: {
                id: scheduleId,
                DoulaProfile: {
                    zoneManager: {
                        some: { id: zoneManager.id },
                    },
                },
            },
            include: {
                client: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
                DoulaProfile: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
                ServicePricing: {
                    include: {
                        service: { select: { name: true } },
                    },
                },
            },
        });
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        const durationMs = schedule.endTime.getTime() - schedule.startTime.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = (durationMs % (1000 * 60 * 60)) / (1000 * 60);
        return {
            success: true,
            message: 'Schedule fetched successfully',
            data: {
                scheduleId: schedule.id,
                clientId: schedule.client.id,
                clientName: schedule.client.user.name,
                doulaId: schedule.DoulaProfile.id,
                doulaName: schedule.DoulaProfile.user.name,
                serviceName: schedule.ServicePricing.service.name,
                startDate: schedule.startTime,
                endDate: schedule.endTime,
                duration: `${durationHours}h ${durationMinutes}m`,
                status: schedule.status,
            },
        };
    }
    async getZoneManagerBookedServiceById(userId, bookingId) {
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!zoneManager) {
            throw new common_1.ForbiddenException('Zone manager profile not found');
        }
        const booking = await this.prisma.serviceBooking.findFirst({
            where: {
                id: bookingId,
                DoulaProfile: {
                    zoneManager: {
                        some: { id: zoneManager.id },
                    },
                },
            },
            include: {
                client: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
                DoulaProfile: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
                service: {
                    include: {
                        service: { select: { name: true } },
                    },
                },
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booked service not found');
        }
        return {
            success: true,
            message: 'Booked service fetched successfully',
            data: {
                serviceBookingId: booking.id,
                clientId: booking.client.id,
                clientName: booking.client.user.name,
                doulaId: booking.DoulaProfile.id,
                doulaName: booking.DoulaProfile.user.name,
                servicePricingId: booking.service.id,
                serviceName: booking.service.service.name,
                startDate: booking.startDate,
                endDate: booking.endDate,
                status: booking.status,
            },
        };
    }
    async getZoneManagerMeetingById(userId, meetingId) {
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!zoneManager) {
            throw new common_1.ForbiddenException('Zone manager profile not found');
        }
        const doulas = await this.prisma.doulaProfile.findMany({
            where: {
                zoneManager: {
                    some: { id: zoneManager.id },
                },
            },
            select: { id: true },
        });
        const doulaIds = doulas.map((d) => d.id);
        const meeting = await this.prisma.meetings.findFirst({
            where: {
                id: meetingId,
                OR: [
                    { zoneManagerProfileId: zoneManager.id },
                    { doulaProfileId: { in: doulaIds } },
                ],
            },
            include: {
                bookedBy: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
                DoulaProfile: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
                Service: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!meeting) {
            throw new common_1.NotFoundException('Meeting not found');
        }
        return {
            success: true,
            message: 'Meeting fetched successfully',
            data: {
                meetingId: meeting.id,
                clientId: meeting.bookedBy.id,
                clientName: meeting.bookedBy.user.name,
                doulaId: meeting.DoulaProfile?.id ?? null,
                doulaName: meeting.DoulaProfile?.user.name ?? null,
                servicePricingId: meeting.serviceId ?? null,
                serviceName: meeting.Service?.name ?? meeting.serviceName,
                startDate: meeting.startTime,
                endDate: meeting.endTime,
                status: meeting.status,
            },
        };
    }
    async getDoulasUnderZm(userId) {
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!zoneManager) {
            throw new common_1.ForbiddenException('Zone manager profile not found');
        }
        const doulas = await this.prisma.doulaProfile.findMany({
            where: { zoneManager: { some: { id: zoneManager.id } } },
            select: {
                id: true, yoe: true,
                qualification: true,
                languages: true,
                specialities: true,
                profile_image: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            }
        });
        const formattedDoulas = doulas.map((doula) => ({
            userId: doula.user.id,
            profileid: doula.id,
            name: doula.user.name,
            email: doula.user.email,
            phone: doula.user.phone,
            yoe: doula.yoe,
            qualification: doula.qualification,
            languages: doula.languages,
            specialities: doula.specialities,
            profileImage: doula.profile_image,
        }));
        return {
            status: 'success',
            message: 'Doulas fetched successfully',
            data: formattedDoulas,
        };
    }
};
exports.ZoneManagerService = ZoneManagerService;
exports.ZoneManagerService = ZoneManagerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZoneManagerService);
//# sourceMappingURL=zone_manager.service.js.map