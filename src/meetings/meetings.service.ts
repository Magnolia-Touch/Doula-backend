import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/common/utility/pagination.util';
import { MeetingStatus, Role } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { findServiceOrThrowwithId, findSlotOrThrow } from 'src/common/utility/service-utils';
import { RescheduleDto } from './dto/reschedule.dto';
import { cancelDto } from './dto/cancel.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ScheduleDoulaDto } from './dto/schedule-doula.dto';

@Injectable()
export class MeetingsService {
    constructor(private readonly prisma: PrismaService,
        private readonly mail: MailerService,) { }

    //common function. used inside enquiry and doula meeting scheduling.
    async scheduleMeeting(Form: any, clientId: string, profileId: string, role: Role, slotParentId?: string) {
        // Generate meet link placeholder (replace with Google Calendar flow later)
        const meetCode = Math.random().toString(36).slice(2, 10);
        const meetLink = `https://meet.google.com/${meetCode}`;
        // Dynamically decide which profile field to set
        const profileData: any = {};

        if (role === Role.ZONE_MANAGER) {
            profileData.zoneManagerProfileId = profileId;
        } else if (role === Role.DOULA) {
            profileData.doulaProfileId = profileId;
        } else if (role === Role.ADMIN) {
            profileData.adminProfileId = profileId;
        }
        const slot = await findSlotOrThrow(this.prisma, Form.slotId);
        const dateInstance = await this.prisma.availableSlotsForMeeting.findUnique({
            where: { id: slot.dateId },
        });

        // create meeting
        const meeting = await this.prisma.meetings.create({
            data: {
                link: meetLink,
                slotId: Form.slotId, //slotId is AvailableMeetingsTimeId
                status: MeetingStatus.SCHEDULED,
                bookedById: clientId,
                remarks: Form.additionalNotes,
                availableSlotsForMeetingId: slotParentId,
                ...profileData
            },
        });
        console.log("meeting created succesfull")
        // 8. Send Mail
        await this.mail.sendMail({
            to: Form.email,
            subject: `Confirmation of your Meeting with ${role} for Service ${Form.name}`,
            template: 'meetings',
            context: {
                date: dateInstance?.date,
                time: slot.startTime + ' - ' + slot.endTime,
                meetLink: meetLink,

            },
        });
        return meeting;
    }


    // Get meetings with optional date and status filters
    // doula have meeting
    // zone manager have meeting
    // admin have meeting
    // role and userId can be retreived from user.
    // take meetings with that profile id
    //filter with startDate endDate, status. 
    async getMeetings(
        params: { startDate?: string; endDate?: string; status?: string; page?: number; limit?: number },
        user: any
    ) {
        const { startDate, endDate, status, page = 1, limit = 10 } = params;

        // Get profileId based on role
        let profile: any = null;

        if (user.role === Role.ZONE_MANAGER) {
            profile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
            });
        } else if (user.role === Role.DOULA) {
            profile = await this.prisma.doulaProfile.findUnique({
                where: { userId: user.id },
            });
        } else if (user.role === Role.ADMIN) {
            profile = await this.prisma.adminProfile.findUnique({
                where: { userId: user.id },
            });
        }

        if (!profile) {
            throw new NotFoundException('Profile Not Found');
        }

        // Begin building where query
        const where: any = {};

        if (status) where.status = status;

        // Filter by date range
        if (startDate || endDate) {
            where.slot = {
                date: {},
            };

            if (startDate) {
                where.slot.date.gte = new Date(startDate);
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // end of day
                where.slot.date.lte = end;
            }
        }

        // Role based filtering → attach profileId into Meetings table
        if (user.role === Role.ZONE_MANAGER) {
            where.zoneManagerProfileId = profile.id;
        } else if (user.role === Role.DOULA) {
            where.doulaProfileId = profile.id;
        } else if (user.role === Role.ADMIN) {
            where.adminProfileId = profile.id;
        }

        return paginate({
            prismaModel: this.prisma.meetings,
            page,
            limit,
            where,
            include: {
                slot: true,
                bookedBy: true,
                AvailableSlotsForMeeting: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }


    async getMeetingById(id: string, user: any) {
        // Step 1: Identify profile for roles
        let profileId: string | null = null;
        const whereCondition: any = { id };
        if (user.role === Role.ZONE_MANAGER) {
            const profile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
            });
            profileId = profile?.id ?? null;
            whereCondition.zoneManagerProfileId = profileId;
        }
        else if (user.role === Role.DOULA) {
            const profile = await this.prisma.doulaProfile.findUnique({
                where: { userId: user.id },
            });
            profileId = profile?.id ?? null;
            whereCondition.doulaProfileId = profileId;
        }
        else if (user.role === Role.ADMIN) {
            const profile = await this.prisma.adminProfile.findUnique({
                where: { userId: user.id },
            });
            profileId = profile?.id ?? null;
            whereCondition.adminProfileId = profileId;
        }
        // Step 3: Fetch meeting with access control
        const meeting = await this.prisma.meetings.findFirst({
            where: whereCondition,
            include: {
                slot: true,
                bookedBy: true,
                ZoneManagerProfile: true,
                DoulaProfile: true,
                AdminProfile: true,
                Service: true,
            },
        });

        if (!meeting) throw new NotFoundException("Meeting not found or access denied");

        return meeting;
    }

    // Cancel meeting (marks canceled + frees slot)
    //any meeting can be cancelled by admin
    //zone manager can cancel only their meeting and meetings of their associated doulas' meeting only
    async cancelMeeting(dto: cancelDto, user: any) {
        // Fetch meeting with doula + zone manager relation
        const meeting = await this.prisma.meetings.findUnique({
            where: { id: dto.meetingId },
            include: {
                slot: true,
                DoulaProfile: {
                    include: {
                        zoneManager: true, // to check zoneManager-doula relationship
                    },
                },
            },
        });

        if (!meeting) throw new NotFoundException("Meeting not found");

        // ---- ADMIN CAN CANCEL ANY MEETING ----
        if (user.role === Role.ADMIN) {
            // Continue to cancellation at bottom
        }

        // ---- ZONE MANAGER PERMISSIONS ----
        else if (user.role === Role.ZONE_MANAGER) {
            // Find Zone Manager Profile
            const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
                include: {
                    doulas: true, // list of doulas under this zone manager
                },
            });

            if (!zoneManagerProfile)
                throw new ForbiddenException("Zone Manager profile not found");

            const zoneManagerId = zoneManagerProfile.id;

            // Condition 1 → Meeting directly belongs to this Zone Manager
            const ownsMeeting = meeting.zoneManagerProfileId === zoneManagerId;

            // Condition 2 → Meeting's doula is in this Zone Manager's doula list
            const doulaBelongsToZoneManager = zoneManagerProfile.doulas.some(
                (doula) => doula.id === meeting.doulaProfileId
            );

            // Validate both cases
            if (!ownsMeeting && !doulaBelongsToZoneManager) {
                throw new ForbiddenException(
                    "You can cancel only your meetings or meetings of your doulas"
                );
            }
        }

        // ---- ALL OTHER ROLES ARE BLOCKED ----
        else {
            throw new ForbiddenException("You are not allowed to cancel meetings");
        }

        // ---- PERFORM CANCELLATION ----
        await this.prisma.meetings.update({
            where: { id: dto.meetingId },
            data: {
                status: "CANCELED",
                cancelledAt: new Date(),
            },
        });

        // ---- FREE THE SLOT ----
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: meeting.slotId },
            data: { isBooked: false, availabe: true },
        });

        return { message: "Meeting canceled and slot freed" };
    }


    // Reschedule meeting to new slot 
    //any meeting can be cancelled by admin 
    //zone manager can cancel only their meeting and meetings of their associated doulas' meeting only
    async rescheduleMeeting(dto: RescheduleDto, user: any) {
        // STEP 1: Fetch meeting with doula + zone manager relation
        const meeting = await this.prisma.meetings.findUnique({
            where: { id: dto.meetingId },
            include: {
                slot: true,
                DoulaProfile: {
                    include: {
                        zoneManager: true, // needed to check if doula belongs to the zone manager
                    },
                },
            },
        });

        if (!meeting) throw new NotFoundException("Meeting not found");


        // ========= ADMIN: CAN RESCHEDULE ANY MEETING =========
        if (user.role === Role.ADMIN) {
            // allowed → skip checks
        }

        // ========= ZONE MANAGER LOGIC =========
        else if (user.role === Role.ZONE_MANAGER) {

            // fetch zone manager profile
            const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
                include: { doulas: true },
            });

            if (!zoneManagerProfile)
                throw new ForbiddenException("Zone Manager profile not found");

            const zoneManagerId = zoneManagerProfile.id;

            // Condition 1 → Meeting is directly under this Zone Manager
            const ownsMeeting = meeting.zoneManagerProfileId === zoneManagerId;

            // Condition 2 → Meeting belongs to their doula
            const doulaBelongsToZoneManager =
                zoneManagerProfile.doulas.some(
                    (d) => d.id === meeting.doulaProfileId
                );

            if (!ownsMeeting && !doulaBelongsToZoneManager) {
                throw new ForbiddenException(
                    "You can reschedule only your meetings or your doulas' meetings"
                );
            }
        }

        // ========= OTHER ROLES → BLOCKED =========
        else {
            throw new ForbiddenException(
                "You are not allowed to reschedule meetings"
            );
        }


        // ========= STEP 2: Free old slot =========
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: meeting.slotId },
            data: { isBooked: false, availabe: true },
        });


        // ========= STEP 3: Validate new slot =========
        const newSlot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: dto.newSlotId },
        });

        if (!newSlot) throw new NotFoundException("New slot not found");

        if (!newSlot.availabe || newSlot.isBooked) {
            throw new BadRequestException("New slot is not available");
        }


        // ========= STEP 4: Update meeting slot =========
        const updated = await this.prisma.meetings.update({
            where: { id: dto.meetingId },
            data: {
                slotId: dto.newSlotId,
                rescheduledAt: new Date(),
                status: MeetingStatus.SCHEDULED,
            },
        });


        // ========= STEP 5: Mark new slot booked =========
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: dto.newSlotId },
            data: { isBooked: true, availabe: false },
        });


        return updated;
    }


    async updateMeetingStatus(dto: UpdateStatusDto, user: any) {
        // STEP 1: Fetch meeting with doula + zone manager associations
        const meeting = await this.prisma.meetings.findUnique({
            where: { id: dto.meetingId },
            include: {
                slot: true,
                DoulaProfile: {
                    include: {
                        zoneManager: true,
                    },
                },
            },
        });

        if (!meeting) {
            throw new NotFoundException("Meeting not found");
        }

        // ADMIN CAN UPDATE ALL 
        if (user.role === Role.ADMIN) {
            // no restrictions
        }
        // ZONE MANAGER PERMISSIONS 
        else if (user.role === Role.ZONE_MANAGER) {

            // Fetch Zone Manager profile + their doulas
            const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
                where: { userId: user.id },
                include: { doulas: true },
            });

            if (!zoneManagerProfile) {
                throw new ForbiddenException("Zone Manager profile not found");
            }

            const zoneManagerId = zoneManagerProfile.id;

            // Condition 1: meeting belongs to zone manager
            const ownsMeeting = meeting.zoneManagerProfileId === zoneManagerId;

            // Condition 2: meeting belongs to their doula
            const doulaBelongsToZoneManager = zoneManagerProfile.doulas.some(
                (d) => d.id === meeting.doulaProfileId
            );

            if (!ownsMeeting && !doulaBelongsToZoneManager) {
                throw new ForbiddenException(
                    "You can update status only for your meetings or your doulas' meetings"
                );
            }
        }

        // OTHER ROLES BLOCKED 
        else {
            throw new ForbiddenException("You are not allowed to update meeting status");
        }


        // If CANCELED → free slot 
        if (dto.status === MeetingStatus.CANCELED) {
            await this.prisma.availableSlotsTimeForMeeting.update({
                where: { id: meeting.slotId },
                data: { isBooked: false, availabe: true },
            });
        }
        // Update Meeting Status 
        const updated = await this.prisma.meetings.update({
            where: { id: dto.meetingId },
            data: {
                status: dto.status,
                cancelledAt: dto.status === MeetingStatus.CANCELED ? new Date() : null,
            },
        });

        return {
            message: "Meeting status updated",
            meeting: updated,
        };
    }

    async deleteAllMeetings(user: any) {
        // Allow only Admin
        if (user.role !== Role.ADMIN) {
            throw new ForbiddenException("Only Admin can perform bulk deletion");
        }
        // Free all meeting slots first
        await this.prisma.availableSlotsTimeForMeeting.updateMany({
            data: {
                isBooked: false,
                availabe: true
            }
        });
        // Delete all meetings
        const result = await this.prisma.meetings.deleteMany({});
        return {
            message: "All meetings deleted successfully",
            count: result.count
        };
    }


    async doulasMeetingSchedule(dto: ScheduleDoulaDto, user: any) {
        // Only Zone Manager is allowed
        if (user.role !== Role.ZONE_MANAGER) {
            throw new ForbiddenException("Only Zone Manager can schedule doula meetings");
        }
        // 1. Fetch zone manager profile to attach meeting to them
        const zoneManagerProfile = await this.prisma.zoneManagerProfile.findUnique({
            where: { userId: user.id },
        });
        if (!zoneManagerProfile) {
            throw new ForbiddenException("Zone Manager profile not found");
        }
        // 2. Fetch doula profile
        const doulaProfile = await this.prisma.doulaProfile.findUnique({
            where: { userId: dto.doulaId },
        });
        const doulausertble = await this.prisma.user.findUnique({
            where: { id: doulaProfile?.id }
        })

        if (!doulaProfile || !doulausertble) {
            throw new NotFoundException("Doula profile not found");
        }
        // 3. Fetch enquiry → contains client, region, service, notes
        const enquiry = await this.prisma.enquiryForm.findUnique({
            where: { id: dto.enquiryId },
            include: {
                service: true,
                region: true,
                slot: true,
                clientProfile: true,
            },
        });
        if (!enquiry) {
            throw new NotFoundException("Enquiry not found");
        }
        if (!enquiry.clientProfile) {
            throw new BadRequestException("Client profile is missing for this enquiry");
        }
        // 4. Validate slot (must be free)
        const slot = await this.prisma.availableSlotsTimeForMeeting.findUnique({
            where: { id: dto.slotId },
        });
        if (!slot) throw new NotFoundException("Slot not found");
        if (!slot.availabe || slot.isBooked) {
            throw new BadRequestException("Slot is not available");
        }
        // 5. Prepare form-like structure required by scheduleMeeting()
        const formData = {
            slotId: dto.slotId,
            additionalNotes: enquiry.additionalNotes ?? null,
            email: enquiry.email,
            name: enquiry.name,
        };
        const service = await findServiceOrThrowwithId(this.prisma, enquiry.serviceId);
        // 6. Call common meeting creator helper
        const meeting = await this.scheduleMeeting(
            formData,
            enquiry.clientProfile.id,      // bookedById → client
            doulaProfile.id,               // profileId (doula)
            Role.DOULA,                    // role of meeting owner
            slot.dateId
        );
        // Mark slot booked
        await this.prisma.availableSlotsTimeForMeeting.update({
            where: { id: dto.slotId },
            data: { isBooked: true, availabe: false },
        });
        // 8. Send Mail
        await this.mail.sendMail({
            to: doulausertble.email,
            subject: `Meeting Scheduled with ${enquiry.name} for ${service.name}`,
            template: 'enquiry',
            context: {
                name: enquiry.name,
                phone_number: enquiry.phone,
                email: enquiry.email,
                message: `A client has shown interest in ${service.name} and booked a meeting slot.`,
            },
        });
        return {
            message: "Doula meeting scheduled successfully",
            meeting,
        };
    }

}
