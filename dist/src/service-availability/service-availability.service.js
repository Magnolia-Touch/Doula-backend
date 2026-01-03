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
exports.DoulaServiceAvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DoulaServiceAvailabilityService = class DoulaServiceAvailabilityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDoulaProfile(userId) {
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { userId },
        });
        if (!doula) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        return doula;
    }
    async createAvailability(dto, user) {
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
        });
        if (!doula) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const { date1, date2, availability } = dto;
        const toJsonAvailability = () => ({
            MORNING: availability.MORNING,
            NIGHT: availability.NIGHT,
            FULLDAY: availability.FULLDAY,
        });
        const normalizeDate = (date) => new Date(`${date}T00:00:00.000Z`);
        const startDate = normalizeDate(date1);
        const endDate = date2 ? normalizeDate(date2) : startDate;
        if (startDate > endDate) {
            throw new common_1.BadRequestException('date1 cannot be after date2');
        }
        const dates = [];
        let current = new Date(startDate);
        while (current <= endDate) {
            dates.push(new Date(current));
            current.setUTCDate(current.getUTCDate() + 1);
        }
        const records = dates.map((date) => ({
            date,
            availability: toJsonAvailability(),
            doulaId: doula.id,
        }));
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
    async findAll(user, query) {
        const doula = await this.getDoulaProfile(user.id);
        const where = {
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
    async findOne(id, user) {
        const doula = await this.getDoulaProfile(user.id);
        const slot = await this.prisma.availableSlotsForService.findFirst({
            where: {
                id,
                doulaId: doula.id,
            },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Service availability not found');
        }
        return {
            message: 'Service availability fetched successfully',
            data: slot,
        };
    }
    async update(id, dto, user) {
        const doula = await this.getDoulaProfile(user.id);
        const slot = await this.prisma.availableSlotsForService.findFirst({
            where: {
                id,
                doulaId: doula.id,
            },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Service availability not found');
        }
        const updatedAvailability = {
            ...slot.availability,
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
    async remove(id, user) {
        const doula = await this.getDoulaProfile(user.id);
        const slot = await this.prisma.availableSlotsForService.findFirst({
            where: {
                id,
                doulaId: doula.id,
            },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Service availability not found');
        }
        await this.prisma.availableSlotsForService.delete({
            where: { id },
        });
        return {
            message: 'Service availability deleted successfully',
        };
    }
    async createOffDays(dto, user) {
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
        });
        if (!doula) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const { date1, date2, offtime } = dto;
        const normalizeDate = (date) => new Date(`${date}T00:00:00.000Z`);
        const startDate = normalizeDate(date1);
        const endDate = date2 ? normalizeDate(date2) : startDate;
        if (startDate > endDate) {
            throw new common_1.BadRequestException('date1 must be before or equal to date2');
        }
        const dates = [];
        const cursor = new Date(startDate);
        while (cursor <= endDate) {
            dates.push(new Date(cursor));
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        const availabilities = await this.prisma.availableSlotsForService.findMany({
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
        const availabilityMap = new Map();
        for (const a of availabilities) {
            availabilityMap.set(a.date.toISOString(), a);
        }
        const invalidDates = [];
        for (const date of dates) {
            const record = availabilityMap.get(date.toISOString());
            if (!record) {
                invalidDates.push(date.toISOString().split('T')[0]);
                continue;
            }
            const availability = record.availability;
            const hasOverlap = (offtime.MORNING && availability.MORNING) ||
                (offtime.NIGHT && availability.NIGHT) ||
                (offtime.FULLDAY && availability.FULLDAY);
            if (!hasOverlap) {
                invalidDates.push(date.toISOString().split('T')[0]);
            }
        }
        if (invalidDates.length) {
            throw new common_1.BadRequestException({
                message: 'Off days can only be marked on dates with active service availability',
                invalidDates,
            });
        }
        const existing = await this.prisma.doulaOffDays.findMany({
            where: {
                doulaProfileId: doula.id,
                date: { in: dates },
            },
            select: { date: true },
        });
        const existingSet = new Set(existing.map((d) => d.date.toISOString()));
        const offtimeJson = {
            MORNING: offtime.MORNING,
            NIGHT: offtime.NIGHT,
            FULLDAY: offtime.FULLDAY,
        };
        const recordsToCreate = dates
            .filter((d) => !existingSet.has(d.toISOString()))
            .map((date) => ({
            date,
            offtime: offtimeJson,
            doulaProfileId: doula.id,
        }));
        if (!recordsToCreate.length) {
            throw new common_1.BadRequestException('Off days already exist for the selected date(s)');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.doulaOffDays.createMany({
                data: recordsToCreate,
            });
            for (const date of dates) {
                const record = availabilityMap.get(date.toISOString());
                if (!record)
                    continue;
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
            message: 'Off days created and service availability disabled successfully',
            data: {
                totalCreated: recordsToCreate.length,
                from: startDate,
                to: endDate,
                offtime,
            },
        };
    }
    async getOffDays(user) {
        const doula = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id },
        });
        if (!doula) {
            throw new common_1.ForbiddenException('Doula profile not found');
        }
        const offDays = await this.prisma.doulaOffDays.findMany({
            where: { doulaProfileId: doula.id },
            orderBy: { date: 'asc' },
        });
        return {
            message: 'Off days fetched successfully',
            data: offDays,
        };
    }
    async getOffdaysbyId(id, user) {
        const doula = await this.getDoulaProfile(user.id);
        const offDay = await this.prisma.doulaOffDays.findFirst({
            where: {
                id,
                doulaProfileId: doula.id,
            },
        });
        if (!offDay) {
            throw new common_1.NotFoundException('Off day not found');
        }
        return {
            message: 'Off day fetched successfully',
            data: offDay,
        };
    }
    async updateOffdays(id, dto, user) {
        const doula = await this.getDoulaProfile(user.id);
        const existing = await this.prisma.doulaOffDays.findFirst({
            where: {
                id,
                doulaProfileId: doula.id,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Off day not found');
        }
        let updatedDate;
        if (dto.date) {
            updatedDate = new Date(dto.date);
            updatedDate.setUTCHours(0, 0, 0, 0);
        }
        const updatedOfftime = dto.offtime
            ? {
                ...existing.offtime,
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
    async removeOffdays(id, user) {
        const doula = await this.getDoulaProfile(user.id);
        const existing = await this.prisma.doulaOffDays.findFirst({
            where: {
                id,
                doulaProfileId: doula.id,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Off day not found');
        }
        await this.prisma.doulaOffDays.delete({
            where: { id },
        });
        return {
            message: 'Off day deleted successfully',
        };
    }
    async getAvailableDoulas(filters) {
        const { startDate, endDate, regionId, serviceId, shift, } = filters;
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        console.log('RAW INPUT DATES', {
            startDate,
            endDate,
            startParsed: start?.toISOString(),
            endParsed: end?.toISOString(),
        });
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
                user: {
                    select: { name: true },
                },
                ServicePricing: {
                    select: {
                        service: {
                            select: { name: true },
                        },
                    },
                },
                AvailableSlotsForService: {
                    select: {
                        date: true,
                        availability: true,
                    },
                },
            },
        });
        const dateList = [];
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
        const mapped = doulas.map((doula) => {
            let unavailableDays = 0;
            const availableShiftSet = new Set();
            const availabilityByDate = new Map(doula.AvailableSlotsForService.map((slot) => {
                const d = new Date(slot.date);
                d.setHours(0, 0, 0, 0);
                return [
                    d.toISOString().split('T')[0],
                    slot.availability,
                ];
            }));
            const hasDateRange = Boolean(start && end);
            if (!hasDateRange) {
                for (const availability of availabilityByDate.values()) {
                    Object.entries(availability)
                        .filter(([_, v]) => v === true)
                        .forEach(([k]) => availableShiftSet.add(k));
                }
            }
            else {
                for (const date of dateList) {
                    const availability = availabilityByDate.get(date);
                    if (!availability) {
                        unavailableDays++;
                        continue;
                    }
                    const trueShifts = Object.entries(availability)
                        .filter(([_, value]) => value === true)
                        .map(([key]) => key);
                    if (trueShifts.length === 0) {
                        unavailableDays++;
                    }
                    else {
                        trueShifts.forEach((s) => availableShiftSet.add(s));
                    }
                }
            }
            let shifts = Array.from(availableShiftSet);
            if (shift) {
                shifts = shifts.filter((s) => s === shift);
            }
            if (shifts.length === 0)
                return null;
            return {
                doulaName: doula.user.name,
                shift: shifts.map((s) => s.toLowerCase()),
                noOfUnavailableDaysInThatPeriod: unavailableDays,
                availableServices: [
                    ...new Set(doula.ServicePricing.map((sp) => sp.service.name)),
                ],
            };
        });
        const filtered = mapped.filter((d) => d !== null);
        filtered.sort((a, b) => a.noOfUnavailableDaysInThatPeriod -
            b.noOfUnavailableDaysInThatPeriod);
        return {
            status: 'success',
            data: filtered,
        };
    }
};
exports.DoulaServiceAvailabilityService = DoulaServiceAvailabilityService;
exports.DoulaServiceAvailabilityService = DoulaServiceAvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoulaServiceAvailabilityService);
//# sourceMappingURL=service-availability.service.js.map