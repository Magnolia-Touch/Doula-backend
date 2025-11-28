import { Injectable, BadRequestException, NotFoundException, ForbiddenException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDoulaServiceAvailability } from "./dto/service-availability.dto";
import { UpdateDoulaServiceAvailabilityDTO } from "./dto/service-availability.dto";
import { paginate } from "src/common/utility/pagination.util";
import { Prisma, Role } from "@prisma/client";
import { format } from "date-fns";
import { findDoulaOrThrowWithId, findRegionOrThrow, findUserRoleById, getServiceSlotOrCreateSlot } from "src/common/utility/service-utils";

@Injectable()
export class DoulaServiceAvailabilityService {
    constructor(private prisma: PrismaService) { }

    async createAvailability(dto: CreateDoulaServiceAvailability, user: any) {
        let profile: any
        //take doula profile from useid.
        profile = await this.prisma.doulaProfile.findUnique({
            where: { userId: user.id }
        })
        // const user = findUserOrThrowwithId(this.prisma, userId)
        const { date, startTime, endTime } = dto;
        //created time setup withdate.
        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);

        if (startDateTime >= endDateTime) {
            throw new BadRequestException("Start time must be before end time.");
        }
        //create AvailableSlotsForMeeting instance first:
        const dateslot = await getServiceSlotOrCreateSlot(this.prisma, dto.date, profile.id)

        //create AvailableSlotsTimeForMeeting for AvailableSlotsForMeeting.
        const timings = await this.prisma.availableSlotsTimeForService.create({
            data: {
                dateId: dateslot.id,
                startTime: startDateTime,
                endTime: endDateTime,
                availabe: true,
            }
        })
        console.log(dateslot)

        return {
            message: "Service Slots created successfully",
            data: {
                date: dateslot.date,
                ownerRole: user.role,
                timeslot: {
                    startTime: timings.startTime,
                    endTime: timings.endTime,
                    available: timings.availabe,
                }
            }
        };
    }


    //continue from here. booked or unbooked filter not needed on slots.
    //get all Slots of Zone Manager. Region Id is passsing for the convnience of user.

    async getAllSlots(
        doulaId: string,
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
        const doula = await findDoulaOrThrowWithId(this.prisma, doulaId);

        // Base date filter
        const where: any = {
            doulaId: doula.id,
            date: {
                gte: firstDate,
                lt: secondDate,
            }
        };

        // Build time filter inside include
        const timeFilter: any = {};
        if (filter === 'booked') timeFilter.isBooked = true;
        if (filter === 'unbooked') timeFilter.isBooked = false;

        return paginate({
            prismaModel: this.prisma.availableSlotsForService,
            page,
            limit,
            where,
            include: {
                AvailableSlotsTimeForService: {
                    where: filter === 'all' ? undefined : timeFilter,
                    orderBy: { startTime: 'asc' }
                }
            },
            orderBy: { date: 'asc' }
        });
    }


    async getSlotById(id: string) {
        const slot = await this.prisma.availableSlotsForService.findUnique({
            where: { id },
            include: {
                AvailableSlotsTimeForService: {
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


    async updateSlotTimeById(dto: UpdateDoulaServiceAvailabilityDTO, timeSlotId: string, userId: string) {
        // Get the timeslot first
        const timeSlot = await this.prisma.availableSlotsTimeForService.findUnique({
            where: { id: timeSlotId, date: { doula: { userId: userId } } },
            include: {
                date: true, // to access the parent slot details
            }
        });

        if (!timeSlot) throw new NotFoundException("Time slot not found");

        const parentSlot = timeSlot.date; // AvailableSlotsForMeeting record
        // ⏰ Build new date-time values
        const startDateTime = new Date(`${parentSlot.date.toISOString().split("T")[0]}T${dto.startTime}:00`);
        const endDateTime = new Date(`${parentSlot.date.toISOString().split("T")[0]}T${dto.endTime}:00`);

        // 🚀 Update time slot
        const updatedTimeSlot = await this.prisma.availableSlotsTimeForService.update({
            where: { id: timeSlotId },
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


    async deleteSlots(timeSlotId: string, userId: string) {
        const timeSlot = await this.prisma.availableSlotsTimeForService.findUnique({
            where: { id: timeSlotId, date: { doula: { userId: userId } } },
            include: {
                date: true, // to access the parent slot details
            }
        });
        if (!timeSlot) throw new NotFoundException("Time slot not found");

        // Delete time slot
        const deletedTimeSlot = await this.prisma.availableSlotsTimeForService.delete({
            where: { id: timeSlotId },
        });

        return {
            message: "Time slot Deleted successfully",
            data: deletedTimeSlot
        };


    }

    //maark a single days availability
    async updateSlotTimeByDate(timeSlotId: string) {
        // Get the timeslot first
        const timeSlot = await this.prisma.availableSlotsForService.findUnique({
            where: { id: timeSlotId }
        });

        if (!timeSlot) throw new NotFoundException("Time slot not found");
        // 🚀 Update time slot
        const updatedslot = await this.prisma.availableSlotsForService.update({
            where: { id: timeSlotId },
            data: {
                availabe: true,
                isBooked: false
            }
        });
        await this.prisma.availableSlotsTimeForService.updateMany({
            where: { id: timeSlotId },
            data: {
                availabe: true,
            }
        });
        return {
            message: "Slot updated successfully",
            data: updatedslot
        };
    }


    //function to take a date range and mark off days.

    //take date range and make the availableSlotForMeeting's available to false. 
    //make sure getSlot never take the one which is not available. add one availabillity filter also in get.


}
