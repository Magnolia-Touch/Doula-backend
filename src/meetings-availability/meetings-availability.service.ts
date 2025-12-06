import { Injectable, BadRequestException, NotFoundException, HttpStatus, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AvailableSlotsForMeetingDto, UpdateSlotsForMeetingTimeDto } from "./dto/meeting-avail.dto";
import { findDoulaOrThrowWithId, findRegionOrThrow, findUserOrThrowwithId, findUserRoleById, getSlotOrCreateSlot } from "src/common/utility/service-utils";
import { paginate } from "src/common/utility/pagination.util";
import { format } from "date-fns";
import { Role } from "@prisma/client";
@Injectable()
export class AvailableSlotsService {
    constructor(private prisma: PrismaService) { }

    async createAvailability(dto: AvailableSlotsForMeetingDto, user: any) {
        let profile: any


        switch (user.role) {
            case Role.ZONE_MANAGER:
                profile = await this.prisma.zoneManagerProfile.findUnique({
                    where: { userId: user.id }
                })
                break

            case Role.DOULA:
                profile = await this.prisma.doulaProfile.findUnique({
                    where: { userId: user.id }
                })
                break

            case Role.ADMIN:
                profile = await this.prisma.adminProfile.findUnique({
                    where: { userId: user.id }
                })
                break
            default:
                throw new ForbiddenException("Invalid user role");

        }
        // const user = findUserOrThrowwithId(this.prisma, userId)
        const { date, startTime, endTime } = dto;

        const slotDate = new Date(date)
        const weekday = format(slotDate, "EEEE");
        console.log(weekday)

        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);

        if (startDateTime >= endDateTime) {
            throw new BadRequestException("Start time must be before end time.");
        }
        //create AvailableSlotsForMeeting instance first:
        const dateslot = await getSlotOrCreateSlot(this.prisma, dto.date, user.role, profile.id)


        //create AvailableSlotsTimeForMeeting for AvailableSlotsForMeeting.
        const timings = await this.prisma.availableSlotsTimeForMeeting.create({
            data: {
                dateId: dateslot.id,
                startTime: startDateTime,
                endTime: endDateTime,
                availabe: true,
                isBooked: false,
            }
        })
        console.log(dateslot)
        //example respones data:
        // {
        //     "date": ,
        //     "ownerRole" :,
        //     "timeslot": {
        //         "startTime": ,
        //         "endTime": ,
        //         "available": ,
        //         "is_booked": ,

        //     }

        // }
        return {
            message: "Slots created successfully",
            data: {
                date: dateslot.date,
                ownerRole: user.role,
                timeslot: {
                    startTime: timings.startTime,
                    endTime: timings.endTime,
                    available: timings.availabe,
                    is_booked: timings.isBooked
                }
            }
        };
    }

    //continue from here. booked or unbooked filter not needed on slots.
    //get all Slots of Zone Manager. Region Id is passsing for the convnience of user.
    async getAllSlots(
        regionId: string,
        startDate: string,
        endDate: string,
        filter: 'all' | 'booked' | 'unbooked' = 'all',
        page: number = 1,
        limit: number = 10
    ) {
        const skip = (page - 1) * limit;

        const firstDate = new Date(startDate);
        const secondDate = new Date(endDate);
        secondDate.setDate(secondDate.getDate() + 1);

        // Validate region
        await findRegionOrThrow(this.prisma, regionId);

        // Find zone manager
        const region = await this.prisma.region.findUnique({
            where: { id: regionId },
            include: { zoneManager: true }
        });

        const manager = region?.zoneManagerId;
        // Base date filter
        const where: any = {
            zoneManagerId: manager,
            date: {
                gte: firstDate,
                lt: secondDate,
            }
        };

        // Build time filter inside include
        const timeFilter: any = {};
        if (filter === 'booked') timeFilter.isBooked = true;
        if (filter === 'unbooked') timeFilter.isBooked = false;

        const result = await paginate({
            prismaModel: this.prisma.availableSlotsForMeeting,
            page,
            limit,
            where,
            include: {
                AvailableSlotsTimeForMeeting: {
                    where: filter === 'all' ? undefined : timeFilter,
                    orderBy: { startTime: 'asc' }
                }
            },
            orderBy: { date: 'asc' }
        });

        const mapped = result.data.map(slot => ({
            dateId: slot.id,
            date: slot.date,
            weekday: slot.weekday,
            availabe: slot.availabe,
            ownerRole: slot.ownerRole,
            adminId: slot.adminId,
            doulaId: slot.doulaId,
            zoneManagerId: slot.zoneManagerId,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,

            timings: (slot as any).AvailableSlotsTimeForMeeting?.map((t: any) => ({
                timeId: t.id,
                startTime: t.startTime,
                endTime: t.endTime,
                availabe: t.availabe,
                isBooked: t.isBooked
            })) || []
        }));

        // ---- Return with mapped data ----
        return {
            data: mapped,
            meta: result.meta
        };
    }


    async getSlotById(id: string) {
        const slot = await this.prisma.availableSlotsForMeeting.findUnique({
            where: { id },
            include: {
                AvailableSlotsTimeForMeeting: {
                    orderBy: { startTime: 'asc' }
                }
            }
        });

        if (!slot) {
            throw new NotFoundException("Slot not found");
        }

        return {
            message: "Slot retrieved successfully",
            slot,
        };
    }


    async updateSlotTimeById(dto: UpdateSlotsForMeetingTimeDto, userId: string) {
        const role = await findUserRoleById(this.prisma, userId);

        // Get the timeslot first
        const timeSlot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: dto.timeSlotId },
            include: {
                date: true, // to access the parent slot details
            }
        });

        if (!timeSlot) throw new NotFoundException("Time slot not found");

        const parentSlot = timeSlot.date; // AvailableSlotsForMeeting record

        // 🛡 permission check — ensure user owns this slot
        if (role === Role.ZONE_MANAGER) {
            const profile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId },
                select: { id: true }
            });

            if (profile?.id !== parentSlot.zoneManagerId)
                throw new ForbiddenException("You cannot update another Zone Manager's slot");
        }

        if (role === Role.DOULA) {
            const profile = await this.prisma.doulaProfile.findUnique({
                where: { userId },
                select: { id: true }
            });

            if (profile?.id !== parentSlot.doulaId)
                throw new ForbiddenException("You cannot update another Doula's slot");
        }

        // ADMIN always allowed
        if (role !== Role.ADMIN && role !== Role.ZONE_MANAGER && role !== Role.DOULA) {
            throw new BadRequestException("Authorization Failed");
        }

        // ⏰ Build new date-time values
        const startDateTime = new Date(`${parentSlot.date.toISOString().split("T")[0]}T${dto.startTime}:00`);
        const endDateTime = new Date(`${parentSlot.date.toISOString().split("T")[0]}T${dto.endTime}:00`);

        // 🚀 Update time slot
        const updatedTimeSlot = await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: dto.timeSlotId },
            data: {
                startTime: startDateTime,
                endTime: endDateTime
            }
        });

        return {
            message: "Time slot updated successfully",
            data: updatedTimeSlot
        };
    }


    async deleteSlots(slotId: string, userId: string) {
        // Get role of the user
        const role = await findUserRoleById(this.prisma, userId);

        // Get slot
        const slot = await this.prisma.availableSlotsForMeeting.findUnique({
            where: { id: slotId },
        });

        if (!slot) {
            throw new NotFoundException("Slot Not Found");
        }

        // ADMIN can delete anyone's slot
        if (role === Role.ADMIN) {
            await this.prisma.availableSlotsForMeeting.delete({
                where: { id: slotId },
            });
            return { message: "Slot Deleted Successfully", status: HttpStatus.NO_CONTENT };
        }

        // ZONE MANAGER allowed only if slot belongs to them
        if (role === Role.ZONE_MANAGER) {
            const manager = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId },
            });

            if (slot.zoneManagerId !== manager?.id) {
                throw new ForbiddenException("You are not allowed to delete this slot");
            }
            await this.prisma.availableSlotsTimeForMeeting.deleteMany({
                where: { dateId: slotId }
            });


            await this.prisma.availableSlotsForMeeting.delete({
                where: { id: slotId },
            });
            return { message: "Slot Deleted Successfully" };
        }

        // DOULA allowed only if slot belongs to them
        if (role === Role.DOULA) {
            const doula = await this.prisma.doulaProfile.findUnique({
                where: { userId },
            });

            if (slot.doulaId !== doula?.id) {
                throw new ForbiddenException("You are not allowed to delete this slot");
            }

            await this.prisma.availableSlotsTimeForMeeting.deleteMany({
                where: { dateId: slotId }
            });

            await this.prisma.availableSlotsForMeeting.delete({
                where: { id: slotId },
            });
            return { message: "Slot Deleted Successfully" };
        }

        throw new BadRequestException("Authorization failed");

    }

    async updateTimeSlotAvailability(id: string, booked: boolean, availabe: boolean) {
        const slot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: id },
        });
        if (!slot) {
            throw new NotFoundException("Slot Not Found")
        };
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: id },
            data: {
                isBooked: false,
                availabe: true
            }
        });
        return { message: "Slot Updated Successfully" }
    }

    /**
     * Disable all AvailableSlotsForMeeting and child time slots in a date range
     */
    async disableSlotsInRange(startDate: string | Date, endDate: string | Date) {
        const from = new Date(startDate);
        const to = new Date(endDate);

        // end date inclusive
        to.setHours(23, 59, 59, 999);

        // find parent slot IDs
        const parentSlots = await this.prisma.availableSlotsForMeeting.findMany({
            where: {
                date: {
                    gte: from,
                    lte: to,
                }
            },
            select: { id: true }
        });

        if (!parentSlots.length) {
            return { message: "No slots found in range", count: 0 };
        }

        const parentIds = parentSlots.map(s => s.id);

        // disable parent + children in one transaction
        await this.prisma.$transaction([
            // disable parent
            this.prisma.availableSlotsForMeeting.updateMany({
                where: { id: { in: parentIds } },
                data: { availabe: false }
            }),

            // disable children
            this.prisma.availableSlotsTimeForMeeting.updateMany({
                where: { dateId: { in: parentIds } },
                data: { availabe: false }
            })
        ]);

        return {
            message: "Slots disabled successfully",
            count: parentIds.length
        };
    }

    async findall(
        user: any,
        startDate: string,
        endDate: string,
        filter: 'all' | 'booked' | 'unbooked' = 'all',
        page: number = 1,
        limit: number = 10
    ) {
        let profile: any
        let ownerField: 'zoneManagerId' | 'doulaId' | 'adminId';

        switch (user.role) {
            case Role.ZONE_MANAGER:
                profile = await this.prisma.zoneManagerProfile.findUnique({
                    where: { userId: user.id },
                });
                ownerField = 'zoneManagerId';
                break;

            case Role.DOULA:
                profile = await this.prisma.doulaProfile.findUnique({
                    where: { userId: user.id },
                });
                ownerField = 'doulaId';
                break;

            case Role.ADMIN:
                profile = await this.prisma.adminProfile.findUnique({
                    where: { userId: user.id },
                });
                ownerField = 'adminId';
                break;

            default:
                throw new ForbiddenException('Invalid user role');
        }

        if (!profile) {
            throw new ForbiddenException('Profile not found for this user');
        }

        const skip = (page - 1) * limit;

        const firstDate = new Date(startDate);
        const secondDate = new Date(endDate);
        // make end exclusive by adding 1 day
        secondDate.setDate(secondDate.getDate() + 1);

        const where: any = {
            [ownerField]: profile.id,      // dynamically use zoneManagerId/doulaId/adminId
            date: {
                gte: firstDate,
                lt: secondDate,
            },
        };

        // Build time filter inside include
        const timeFilter: any = {};
        if (filter === 'booked') timeFilter.isBooked = true;
        if (filter === 'unbooked') timeFilter.isBooked = false;

        const result = await paginate({
            prismaModel: this.prisma.availableSlotsForMeeting,
            page,
            limit,
            where,
            include: {
                AvailableSlotsTimeForMeeting: {
                    where: filter === 'all' ? undefined : timeFilter,
                    orderBy: { startTime: 'asc' }
                }
            },
            orderBy: { date: 'asc' }
        });

        // >>> transform rows here
        // ---- Map data ----
        const mapped = result.data.map(slot => ({
            dateId: slot.id,
            date: slot.date,
            weekday: slot.weekday,
            availabe: slot.availabe,
            ownerRole: slot.ownerRole,
            adminId: slot.adminId,
            doulaId: slot.doulaId,
            zoneManagerId: slot.zoneManagerId,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,

            timings: (slot as any).AvailableSlotsTimeForMeeting?.map((t: any) => ({
                timeId: t.id,
                startTime: t.startTime,
                endTime: t.endTime,
                availabe: t.availabe,
                isBooked: t.isBooked
            })) || []
        }));

        // ---- Return with mapped data ----
        return {
            data: mapped,
            meta: result.meta
        };
    }




}

