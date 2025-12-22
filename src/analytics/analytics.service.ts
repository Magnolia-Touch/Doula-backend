// Number of customer, schedules today, total booking service, total revenue 

// All with filter date rang

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from 'src/common/utility/pagination.util';
import { FilterUserDto } from './filter-user.dto';
import { Role } from '@prisma/client';
import { format } from 'date-fns';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async listUsers(query: FilterUserDto) {
        const { role, is_active } = query;

        // Pagination
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 10;

        const where: any = {};

        if (role) where.role = role;
        if (is_active !== undefined) {
            where.is_active = is_active
        }


        return paginate({
            prismaModel: this.prisma.user,
            page,
            limit,
            where,
            include: {
                clientProfile: true,
                doulaProfile: true,
                zonemanagerprofile: true,
                adminProfile: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async countUsersByRole() {
        const clients = await this.prisma.user.count({ where: { role: Role.CLIENT } });
        const doulas = await this.prisma.user.count({ where: { role: Role.DOULA } });
        const zonemanagers = await this.prisma.user.count({ where: { role: Role.ZONE_MANAGER } });
        const admins = await this.prisma.user.count({ where: { role: Role.ADMIN } });
        const total = await this.prisma.user.count();

        return {
            total,
            clients,
            doulas,
            zonemanagers,
            admins,
        };
    }

    async ActivecountUsersByRole() {
        const clients = await this.prisma.user.count({ where: { role: Role.CLIENT, is_active: true } });
        const doulas = await this.prisma.user.count({ where: { role: Role.DOULA, is_active: true } });
        const zonemanagers = await this.prisma.user.count({ where: { role: Role.ZONE_MANAGER, is_active: true } });
        const admins = await this.prisma.user.count({ where: { role: Role.ADMIN, is_active: true } });
        const total = await this.prisma.user.count();

        return {
            total,
            clients,
            doulas,
            zonemanagers,
            admins,
        };
    }

    async inactivecountUsersByRole() {
        const clients = await this.prisma.user.count({ where: { role: Role.CLIENT, is_active: false } });
        const doulas = await this.prisma.user.count({ where: { role: Role.DOULA, is_active: false } });
        const zonemanagers = await this.prisma.user.count({ where: { role: Role.ZONE_MANAGER, is_active: false } });
        const admins = await this.prisma.user.count({ where: { role: Role.ADMIN, is_active: false } });
        const total = await this.prisma.user.count();

        return {
            total,
            clients,
            doulas,
            zonemanagers,
            admins,
        };
    }


    async getBookingStats() {
        const totalBookings = await this.prisma.serviceBooking.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        const bookings = await this.prisma.serviceBooking.findMany({
            select: { paymentDetails: true },
        });

        let totalRevenue = 0;

        const FormattedCounts = {
            ACTIVE: 0,
            COMPLETED: 0,
            CANCELED: 0
        }
        totalBookings.forEach((item) => {
            FormattedCounts[item.status] = item._count.status
        })
        return {
            FormattedCounts
        };
    }

    async getMeetingstats() {
        const totalMeetings = await this.prisma.meetings.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        })

        const FormattedCounts = {
            SCHEDULED: 0,
            COMPLETED: 0,
            CANCELED: 0,
        }

        totalMeetings.forEach((item) => {
            FormattedCounts[item.status] = item._count.status
        })
        return FormattedCounts;
    }


    async getDailyActivity(startDate?: string, endDate?: string) {
        let start: Date | undefined;
        let end: Date | undefined;

        if (startDate) start = startOfDay(new Date(startDate));
        if (endDate) end = endOfDay(new Date(endDate));

        const dateFilter = start && end ? { gte: start, lte: end }
            : start ? { gte: start }
                : end ? { lte: end }
                    : undefined;

        // BOOKINGS BY createdAt
        const bookings = await this.prisma.serviceBooking.findMany({
            where: {
                ...(dateFilter && { createdAt: dateFilter }),
            },
            select: { createdAt: true },
        });

        // MEETINGS BY createdAt
        const meetings = await this.prisma.meetings.findMany({
            where: {
                ...(dateFilter && { createdAt: dateFilter }),
            },
            select: { createdAt: true },
        });

        const map = new Map();

        // collect bookings
        bookings.forEach((b) => {
            const date = format(b.createdAt, 'yyyy-MM-dd');
            if (!map.has(date)) map.set(date, { noOfBookings: 0, noOfMeetings: 0 });
            map.get(date).noOfBookings++;
        });

        // collect meetings
        meetings.forEach((m) => {
            const date = format(m.createdAt, 'yyyy-MM-dd');
            if (!map.has(date)) map.set(date, { noOfBookings: 0, noOfMeetings: 0 });
            map.get(date).noOfMeetings++;
        });

        // final response list
        const result: Array<{ date: string; weekday: string; noOfBookings: number; noOfMeetings: number }> = [];

        for (const [date, counts] of map.entries()) {
            const weekday = format(new Date(date), 'EEE'); // Mon, Tue, etc.

            result.push({
                date,
                weekday,
                noOfBookings: counts.noOfBookings,
                noOfMeetings: counts.noOfMeetings,
            });
        }

        result.sort((a, b) => a.date.localeCompare(b.date));

        return result;
    }


    async calenderSummary(userId: string, startDate: string, endDate: string) {
        const zoneManager = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId: userId },
            include: {
                doulas: {
                    select: { id: true }
                }
            }
        });
        if (!zoneManager) {
            throw new NotFoundException("Zone Manager Not Found")
        }

        const doulaIds = zoneManager.doulas.map(d => d.id);

        const meetings = await this.prisma.meetings.findMany({
            where: {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                },
                OR: [
                    { zoneManagerProfileId: zoneManager.id },
                    { doulaProfileId: { in: doulaIds } }
                ]
            },
            select: {
                date: true
            }
        })

        const schedules = await this.prisma.schedules.findMany({
            where: {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                },
                doulaProfileId: { in: doulaIds }
            },
            select: { date: true }
        })

        const resultMap = new Map<string, { appointmentCount: number; scheduleCount: number }>();
        const normalizeDate = (date: Date) =>
            date.toISOString().split("T")[0];
        // Meetings count
        meetings.forEach(m => {
            const key = normalizeDate(m.date);
            if (!resultMap.has(key)) {
                resultMap.set(key, { appointmentCount: 0, scheduleCount: 0 });
            }
            resultMap.get(key)!.appointmentCount += 1;
        });
        // Schedules count
        schedules.forEach(s => {
            const key = normalizeDate(s.date);
            if (!resultMap.has(key)) {
                resultMap.set(key, { appointmentCount: 0, scheduleCount: 0 });
            }
            resultMap.get(key)!.scheduleCount += 1;
        });
        const response = Array.from(resultMap.entries()).map(
            ([date, counts]) => ({
                date,
                appointmentCount: counts.appointmentCount,
                scheduleCount: counts.scheduleCount
            })
        );

        return { data: response }



    }
}