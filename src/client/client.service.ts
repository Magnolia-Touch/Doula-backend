import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
// import { UpdateclientsDto } from './dto/update-zone-manager.dto';
import { BookingStatus, MeetingStatus, Role, ServiceStatus } from '@prisma/client';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) { }

  // Create new Clients
  async create(dto: CreateClientDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const clients = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: Role.CLIENT,
        clientProfile: {
          create: {},
        },
      },
      include: { clientProfile: true },
    });

    return { message: 'Clients created successfully', data: clients };
  }

  // Get all Clients
  async get() {
    const clientss = await this.prisma.user.findMany({
      where: { role: Role.CLIENT },
      include: { clientProfile: true },
    });
    return { message: 'Clients Fetched Successfully', data: clientss };
  }

  // Get Clients by ID
  async getById(id: string) {
    const clients = await this.prisma.user.findUnique({
      where: { id },
      include: { clientProfile: true },
    });

    if (!clients || clients.role !== Role.CLIENT) {
      throw new NotFoundException('Clients not found');
    }

    return { message: 'Clients fetched successfully', data: clients };
  }

  // Look on Client needed side
  // // ✅ Update Zone Manager details
  // async update(id: string, dto: UpdateclientsDto) {
  //     const existing = await this.prisma.user.findUnique({ where: { id } });
  //     if (!existing || existing.role !== Role.ZONE_MANAGER) {
  //         throw new NotFoundException('Zone Manager not found');
  //     }

  //     const updated = await this.prisma.user.update({
  //         where: { id },
  //         data: {
  //             name: dto.name ?? existing.name,
  //             email: dto.email ?? existing.email,
  //             phone: dto.phone ?? existing.phone,
  //             clientsprofile: dto.zoneName || dto.region ? {
  //                 update: {
  //                     zoneName: dto.zoneName ?? existing.clientsprofile?.zoneName,
  //                     region: dto.region ?? existing.clientsprofile?.region,
  //                 },
  //             } : undefined,
  //         },
  //         include: { clientsprofile: true },
  //     });

  //     return { message: 'Zone Manager updated successfully', data: updated };
  // }

  // Delete Zone Manager
  async delete(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== Role.CLIENT) {
      throw new NotFoundException('Client not found');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'Client deleted successfully', data: null };
  }

  async bookedServices(userId: string) {
    // 1. Fetch client profile with schedules
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        Schedules: {
          include: {
            serviceBooking: {
              include: {
                region: {
                  select: {
                    regionName: true,
                  },
                },
                service: {
                  include: {
                    service: {
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
                        name: true,
                      },
                    },
                    DoulaGallery: {
                      select: {
                        url: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!clientProfile) {
      throw new Error('Client profile not found');
    }

    // 2. Transform response (UNCHANGED STRUCTURE)
    return clientProfile.Schedules.map((schedule) => {
      const booking = schedule.serviceBooking;

      return {
        // User details
        userId: clientProfile.user.id,
        name: clientProfile.user.name,
        email: clientProfile.user.email,
        phone: clientProfile.user.phone,
        role: clientProfile.user.role,

        // Client profile
        profileId: clientProfile.id,

        // Booking details
        serviceBookingId: booking.id,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,

        // Region
        regionName: booking.region.regionName,

        // Service details
        serviceId: booking.service.service.id,
        servicePricingId: booking.servicePricingId,
        service: booking.service.service.name,

        // Doula details
        doulaName: booking.DoulaProfile.user.name,
        mainDoulaImage: booking.DoulaProfile.profile_image,
      };
    });
  }

  async bookedServiceById(userId: string, serviceBookingId: string) {
    // 1. Fetch client profile
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!clientProfile) {
      throw new Error('Client profile not found');
    }

    // 2. Fetch schedule linked to booking & validate ownership
    const schedule = await this.prisma.schedules.findFirst({
      where: {
        bookingId: serviceBookingId,
        clientId: clientProfile.id,
      },
      include: {
        serviceBooking: {
          include: {
            region: {
              select: {
                regionName: true,
              },
            },
            service: {
              include: {
                service: {
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
                    name: true,
                  },
                },
                DoulaGallery: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new Error('Service booking not found');
    }

    const booking = schedule.serviceBooking;

    // 3. Response mapping (UNCHANGED SHAPE)
    return {
      // User details
      userId: clientProfile.user.id,
      name: clientProfile.user.name,
      email: clientProfile.user.email,
      phone: clientProfile.user.phone,
      role: clientProfile.user.role,

      // Client profile
      profileId: clientProfile.id,

      // Booking details
      serviceBookingId: booking.id,
      status: booking.status,
      startDate: booking.startDate,
      endDate: booking.endDate,

      // Region
      regionName: booking.region.regionName,

      // Service details
      serviceId: booking.service.service.id,
      servicePricingId: booking.servicePricingId,
      service: booking.service.service.name,

      // Doula details
      doulaName: booking.DoulaProfile.user.name,
      mainDoulaImage: booking.DoulaProfile.profile_image,
    };
  }

  async bookedSchedules(userId: string) {
    // 1. Fetch client profile with schedules
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        Schedules: {
          include: {
            serviceBooking: {
              include: {
                region: {
                  select: {
                    regionName: true,
                  },
                },
                service: {
                  include: {
                    service: {
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
                        name: true,
                      },
                    },
                    DoulaGallery: {
                      select: {
                        url: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!clientProfile) {
      throw new Error('Client profile not found');
    }

    // 2. Transform response (UNCHANGED STRUCTURE)
    return clientProfile.Schedules.map((schedule) => {
      const booking = schedule.serviceBooking;

      return {
        // User details
        scheduleId: schedule.id,
        userId: clientProfile.user.id,
        name: clientProfile.user.name,
        email: clientProfile.user.email,
        phone: clientProfile.user.phone,
        role: clientProfile.user.role,

        // Client profile
        profileId: clientProfile.id,

        // Booking details
        serviceBookingId: booking.id,
        status: schedule.status,
        startDate: booking.startDate,
        endDate: booking.endDate,

        // Region
        regionName: booking.region.regionName,

        // Service details
        serviceId: booking.service.service.id,
        servicePricingId: booking.servicePricingId,
        service: booking.service.service.name,

        // Doula details
        doulaName: booking.DoulaProfile.user.name,
        mainDoulaImage: booking.DoulaProfile.profile_image,
      };
    });
  }

  async bookedScheduleById(userId: string, serviceBookingId: string) {
    // 1. Fetch client profile
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!clientProfile) {
      throw new Error('Client profile not found');
    }

    // 2. Fetch schedule linked to booking & validate ownership
    const schedule = await this.prisma.schedules.findFirst({
      where: {
        id: serviceBookingId,
        clientId: clientProfile.id,
      },
      include: {
        serviceBooking: {
          include: {
            region: {
              select: {
                regionName: true,
              },
            },
            service: {
              include: {
                service: {
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
                    name: true,
                  },
                },
                DoulaGallery: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new Error('Service booking not found');
    }

    const booking = schedule.serviceBooking;

    // 3. Response mapping (UNCHANGED SHAPE)
    return {
      // User details
      scheduleId: schedule.id,
      userId: clientProfile.user.id,
      name: clientProfile.user.name,
      email: clientProfile.user.email,
      phone: clientProfile.user.phone,
      role: clientProfile.user.role,

      // Client profile
      profileId: clientProfile.id,

      // Booking details
      serviceBookingId: booking.id,
      status: schedule.status,
      startDate: booking.startDate,
      endDate: booking.endDate,

      // Region
      regionName: booking.region.regionName,

      // Service details
      serviceId: booking.service.service.id,
      servicePricingId: booking.servicePricingId,
      service: booking.service.service.name,

      // Doula details
      doulaName: booking.DoulaProfile.user.name,
      mainDoulaImage: booking.DoulaProfile.profile_image,
    };
  }


  async cancelSchedules(userId: string, scheduleId: string) {
    // 1. Fetch client profile
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw new Error('Client profile not found');
    }

    // 2. Fetch booking and validate ownership
    const schedules = await this.prisma.schedules.findFirst({
      where: {
        id: scheduleId,
        clientId: clientProfile.id,
      },
    });

    if (!schedules) {
      throw new Error('schedules booking not found');
    }

    // 3. Business rules
    if (schedules.status === ServiceStatus.CANCELED) {
      throw new Error('Service schedules is already canceled');
    }

    if (schedules.status === ServiceStatus.COMPLETED) {
      throw new Error('Completed schedules cannot be canceled');
    }

    // 4. Cancel booking
    const canncelschedules = await this.prisma.schedules.update({
      where: { id: schedules.id },
      data: {
        status: BookingStatus.CANCELED,
        cancelledAt: new Date(),
      },
    });

    // 5. Optional: release slots / trigger refund / notify doula
    // await this.releaseServiceSlots(booking.id);
    // await this.refundPayment(booking.paymentDetails);
    // await this.notifyDoula(booking.doulaProfileId);

    return {
      message: 'schedulescanceled successfully',
      serviceBookingId: canncelschedules.id,
      status: canncelschedules.status,
    };
  }


  async cancelServiceBooking(userId: string, serviceBookingId: string) {
    // 1. Fetch client profile
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw new Error('Client profile not found');
    }

    // 2. Fetch booking and validate ownership
    const booking = await this.prisma.serviceBooking.findFirst({
      where: {
        id: serviceBookingId,
        clientId: clientProfile.id,
      },
    });

    if (!booking) {
      throw new Error('Service booking not found');
    }

    // 3. Business rules
    if (booking.status === 'CANCELED') {
      throw new Error('Service booking is already canceled');
    }

    if (booking.status === 'COMPLETED') {
      throw new Error('Completed bookings cannot be canceled');
    }

    // 4. Cancel booking
    const canceledBooking = await this.prisma.serviceBooking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELED,
        cancelledAt: new Date(),
      },
    });

    // 5. Optional: release slots / trigger refund / notify doula
    // await this.releaseServiceSlots(booking.id);
    // await this.refundPayment(booking.paymentDetails);
    // await this.notifyDoula(booking.doulaProfileId);

    return {
      message: 'Service booking canceled successfully',
      serviceBookingId: canceledBooking.id,
      status: canceledBooking.status,
    };
  }

  async Meetings(userId: string) {
    // 1️⃣ Fetch client profile with meetings
    const clientProfile = await this.prisma.clientProfile.findUnique({
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
        Meetings: {
          include: {
            DoulaProfile: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
            ZoneManagerProfile: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
            AvailableSlotsForMeeting: {
              select: { weekday: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
    }

    // 2️⃣ Transform response
    return clientProfile.Meetings.map((meeting) => {
      const hostname =
        meeting.DoulaProfile?.user?.name ??
        meeting.ZoneManagerProfile?.user?.name ??
        null;

      const meetingWith = meeting.doulaProfileId
        ? 'DOULA'
        : meeting.zoneManagerProfileId
          ? 'ZONE_MANAGER'
          : null;

      return {
        // ===== CLIENT =====
        clientId: clientProfile.user.id,
        clientName: clientProfile.user.name,
        clientEmail: clientProfile.user.email,
        clientPhone: clientProfile.user.phone,
        clientProfileId: clientProfile.id,

        // ===== MEETING =====
        meetingId: meeting.id,
        meetingWith,
        hostname,

        meetingDate: meeting.date,
        weekday: meeting.AvailableSlotsForMeeting?.weekday ?? null,
        startTime: meeting.startTime,
        endTime: meeting.endTime,

        link: meeting.link,
        serviceName: meeting.serviceName,
        remarks: meeting.remarks,
        status: meeting.status,
      };
    });
  }

  async meetingById(userId: string, meetingId: string) {
    // 1️⃣ Fetch client profile
    const clientProfile = await this.prisma.clientProfile.findUnique({
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
      },
    });

    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
    }

    // 2️⃣ Fetch meeting (ownership enforced)
    const meeting = await this.prisma.meetings.findFirst({
      where: {
        id: meetingId,
        bookedById: clientProfile.id,
      },
      include: {
        DoulaProfile: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        ZoneManagerProfile: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        AvailableSlotsForMeeting: {
          select: { weekday: true },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // 3️⃣ Resolve host & meeting type
    const hostname =
      meeting.DoulaProfile?.user?.name ??
      meeting.ZoneManagerProfile?.user?.name ??
      null;

    const meetingWith = meeting.doulaProfileId
      ? 'DOULA'
      : meeting.zoneManagerProfileId
        ? 'ZONE_MANAGER'
        : null;

    // 4️⃣ Response mapping (consistent with list API)
    return {
      // ===== CLIENT =====
      clientId: clientProfile.user.id,
      clientName: clientProfile.user.name,
      clientEmail: clientProfile.user.email,
      clientPhone: clientProfile.user.phone,
      clientProfileId: clientProfile.id,

      // ===== MEETING =====
      meetingId: meeting.id,
      meetingWith,
      hostname,

      meetingDate: meeting.date,
      weekday: meeting.AvailableSlotsForMeeting?.weekday ?? null,
      startTime: meeting.startTime,
      endTime: meeting.endTime,

      link: meeting.link,
      serviceName: meeting.serviceName,
      remarks: meeting.remarks,
      status: meeting.status,

      createdAt: meeting.createdAt,
      cancelledAt: meeting.cancelledAt,
      rescheduledAt: meeting.rescheduledAt,
    };
  }

  async cancelMeeting(userId: string, meetingId: string) {
    // 1️⃣ Fetch client profile
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
    }

    // 2️⃣ Fetch meeting with linked time slots
    const meeting = await this.prisma.meetings.findFirst({
      where: {
        id: meetingId,
        bookedById: clientProfile.id,
      },
      include: {
        AvailableSlotsTimeForMeeting: {
          select: { id: true },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // 3️⃣ Business rules
    if (meeting.status === MeetingStatus.CANCELED) {
      throw new BadRequestException('Meeting is already canceled');
    }

    if (meeting.status === MeetingStatus.COMPLETED) {
      throw new BadRequestException('Completed meetings cannot be canceled');
    }

    // 4️⃣ Transaction: cancel meeting + release slots
    const canceledMeeting = await this.prisma.$transaction(async (tx) => {
      // Cancel meeting
      const updated = await tx.meetings.update({
        where: { id: meeting.id },
        data: {
          status: MeetingStatus.CANCELED,
          cancelledAt: new Date(),
        },
      });

      // Release all booked time slots
      if (meeting.AvailableSlotsTimeForMeeting.length > 0) {
        await tx.availableSlotsTimeForMeeting.updateMany({
          where: {
            id: {
              in: meeting.AvailableSlotsTimeForMeeting.map((s) => s.id),
            },
          },
          data: {
            isBooked: false,
            availabe: true,
          },
        });
      }

      return updated;
    });

    return {
      message: 'Meeting canceled successfully',
      meetingId: canceledMeeting.id,
      status: canceledMeeting.status,
      cancelledAt: canceledMeeting.cancelledAt,
    };
  }

  async recentActivity(userId: string) {
    // 1. Get client profile
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw new Error('Client profile not found');
    }

    // 2. Fetch bookings
    const bookings = await this.prisma.serviceBooking.findMany({
      where: {
        clientId: clientProfile.id,
      },
      include: {
        DoulaProfile: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    // 3. Fetch meetings
    const meetings = await this.prisma.meetings.findMany({
      where: {
        bookedById: clientProfile.id,
      },
      include: {
        DoulaProfile: {
          include: {
            user: { select: { name: true } },
          },
        },
        ZoneManagerProfile: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
    type RecentActivity = {
      type:
      | 'BOOKING_CREATED'
      | 'BOOKING_COMPLETED'
      | 'BOOKING_CANCELED'
      | 'MEETING_SCHEDULED'
      | 'MEETING_CANCELED';
      title: string;
      description: string;
      date: Date;
    };

    const bookingActivities = bookings.flatMap((booking): RecentActivity[] => {
      const activities: RecentActivity[] = [];

      // Booking Created
      activities.push({
        type: 'BOOKING_CREATED',
        title: 'New Booking Created',
        description: `You booked ${booking.DoulaProfile.user.name}`,
        date: booking.createdAt,
      });

      // Booking Completed
      if (booking.status === 'COMPLETED') {
        activities.push({
          type: 'BOOKING_COMPLETED',
          title: 'Booking Completed',
          description: `Your booking with ${booking.DoulaProfile.user.name} was completed successfully`,
          date: booking.updatedAt,
        });
      }

      // Booking Canceled
      if (booking.status === 'CANCELED') {
        activities.push({
          type: 'BOOKING_CANCELED',
          title: 'Booking Canceled',
          description: `You canceled your booking with ${booking.DoulaProfile.user.name}`,
          date: booking.updatedAt, // ideally booking.canceledAt if you add it
        });
      }

      return activities;
    });
    const meetingActivities = meetings.map((meeting) => {
      let hostName = 'Host';

      if (meeting.DoulaProfile?.user?.name) {
        hostName = meeting.DoulaProfile.user.name;
      } else if (meeting.ZoneManagerProfile?.user?.name) {
        hostName = meeting.ZoneManagerProfile.user.name;
      }

      return {
        type: 'MEETING_SCHEDULED',
        title: 'Meeting Scheduled',
        description: `Initial consultation with ${hostName}`,
        date: meeting.createdAt,
      };
    });

    // 5. Merge + sort
    return [...bookingActivities, ...meetingActivities].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }

  async profile(userId: string) {
    // 1. Fetch client profile with user
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!clientProfile) {
      throw new Error('Client profile not found');
    }

    // 2. Response mapping
    return {
      // User details
      userId: clientProfile.user.id,
      name: clientProfile.user.name,
      email: clientProfile.user.email,
      phone: clientProfile.user.phone,
      profile_image: clientProfile.profile_image,
      region: clientProfile.region,

      // Client profile details
      profileId: clientProfile.id,
      address: clientProfile.address,

      // Member since (client creation date)
      memberSince: clientProfile.createdAt,
    };
  }
  async updateProfile(userId: string, dto: UpdateClientDto) {
    const { name, address, region } = dto;

    // 1. Fetch client profile WITH user relation
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
    }

    // 2. Update user name (if provided)
    await this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    // 3. Update client profile
    const updatedProfile = await this.prisma.clientProfile.update({
      where: { userId },
      data: {
        address,
        region,
      },
      include: {
        user: true,
      },
    });

    // 4. Response mapping (USE updatedProfile)
    return {
      // User details
      userId: updatedProfile.user.id,
      name: updatedProfile.user.name,
      email: updatedProfile.user.email,
      phone: updatedProfile.user.phone,

      // Client profile details
      profileId: updatedProfile.id,
      profile_image: updatedProfile.profile_image,
      address: updatedProfile.address,
      region: updatedProfile.region,

      // Metadata
      memberSince: updatedProfile.createdAt,
    };
  }


  async addClientProfileImage(userId: string, profileImageUrl?: string) {
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
    }
    await this.prisma.clientProfile.update({
      where: { userId: userId },
      data: { profile_image: profileImageUrl },
    });

    return {
      message: 'Image uploaded successfully',
      data: clientProfile,
    };
  }

  async getClientProfileImages(userId: string) {
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      select: { id: true, profile_image: true },
    });

    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
    }

    const images = await this.prisma.clientProfile.findUnique({
      where: {
        userId: clientProfile.id,
      },
      select: { profile_image: true },
    });

    return {
      status: 'success',
      message: 'Client Profile Image fetched successfully',
      data: clientProfile,
    };
  }

  async deleteClientProfileImage(userId: string) {
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!clientProfile) {
      throw new NotFoundException('Client profile not found');
    }
    const image = await this.prisma.clientProfile.update({
      where: { userId: userId },
      data: { profile_image: null },
    });
    return { message: 'Image deleted successfully' };
  }
}
