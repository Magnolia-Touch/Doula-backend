import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  Body,
  UseInterceptors,
  Post,
  BadRequestException,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { ClientsService } from './client.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateClientDto } from './dto/update-client.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiConsumes } from '@nestjs/swagger';
import { S3Service } from 'src/s3/s3.service';
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@Controller({
  path: 'clients',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(
    private readonly clientService: ClientsService,
    private readonly s3Service: S3Service,
  ) {}

  //  SERVICE BOOKINGS
  // GET: All booked services
  @ApiOperation({ summary: 'Get all booked services for the client' })
  @ApiResponse({
    status: 200,
    description: 'Booked services fetched successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: [
          {
            userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
            name: 'anil',
            email: 'nandhudevanand4419@gmail.com',
            phone: '9876543230',
            role: 'CLIENT',
            profileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
            serviceBookingId: '5586fd37-e090-472f-9e45-264f204ba31f',
            status: 'ACTIVE',
            startDate: '2027-01-13T00:00:00.000Z',
            endDate: null,
            regionName: 'California',
            serviceId: '26c11b42-417c-4e37-8543-4ef609646718',
            servicePricingId: 'a06e7596-b571-4b20-ae57-0df58983f159',
            service: 'Birth Doula',
            doulaName: 'Andy gullit',
            doulaProfileId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
            doulaUserId: 'a6a18005-37d9-4df3-89db-32ecc443f1b9',
            doulaEmail: 'parasyadigitalhub@gmail.com',
            mainDoulaImage: null,
            timeshift: 'FULLDAY',
          },
          {
            userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
            name: 'anil',
            email: 'nandhudevanand4419@gmail.com',
            phone: '9876543230',
            role: 'CLIENT',
            profileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
            serviceBookingId: '370f24d3-727a-4b72-8c3e-0d587bbdd4a6',
            status: 'ACTIVE',
            startDate: '2025-07-08T00:00:00.000Z',
            endDate: '2025-07-09T00:00:00.000Z',
            regionName: 'Texas',
            serviceId: '26c11b42-417c-4e37-8543-4ef609646718',
            servicePricingId: 'dabfb704-5195-4c68-9038-1f3d12fe41c0',
            service: 'Birth Doula',
            doulaName: 'Elza',
            doulaProfileId: '76513350-c5b2-4a58-889c-ae7b420dcc5b',
            doulaUserId: '9dc9515f-0d8f-46d3-ae6e-be8e5d583947',
            doulaEmail: 'elso@test.com',
            mainDoulaImage: 'uploads/doulas/1767276779045-899824386.png',
            timeshift: 'FULLDAY',
          },
        ],
      },
    },
  })
  @Get('booked-services')
  async getBookedServices(@Req() req) {
    return this.clientService.bookedServices(req.user.id);
  }

  // GET: Booked service by ID
  @ApiOperation({ summary: 'Get booked service by ID' })
  @ApiParam({ name: 'id', description: 'Booked service ID' })
  @ApiResponse({
    status: 200,
    description: 'Booked service details',
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
          name: 'anil',
          email: 'nandhudevanand4419@gmail.com',
          phone: '9876543230',
          role: 'CLIENT',
          profileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
          serviceBookingId: '5586fd37-e090-472f-9e45-264f204ba31f',
          status: 'ACTIVE',
          startDate: '2027-01-13T00:00:00.000Z',
          endDate: null,
          regionName: 'California',
          serviceId: '26c11b42-417c-4e37-8543-4ef609646718',
          servicePricingId: 'a06e7596-b571-4b20-ae57-0df58983f159',
          service: 'Birth Doula',
          doulaName: 'Andy gullit',
          doulaProfileId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          doulaUserId: 'a6a18005-37d9-4df3-89db-32ecc443f1b9',
          doulaEmail: 'parasyadigitalhub@gmail.com',
          mainDoulaImage: null,
          timeshift: 'FULLDAY',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Booked service not found' })
  @Get('booked-services/:id')
  async getBookedServiceById(@Req() req, @Param('id') id: string) {
    return this.clientService.bookedServiceById(req.user.id, id);
  }

  // PATCH: Cancel service booking
  @ApiOperation({ summary: 'Cancel a booked service' })
  @ApiParam({ name: 'id', description: 'Booked service ID' })
  @ApiResponse({
    status: 200,
    description: 'Service cancelled successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Service booking canceled successfully',
        data: {
          message: 'Service booking canceled successfully',
          serviceBookingId: '5586fd37-e090-472f-9e45-264f204ba31f',
          status: 'CANCELED',
        },
      },
    },
  })
  @Patch('booked-services/:id/cancel')
  async cancelServiceBooking(@Req() req, @Param('id') id: string) {
    return this.clientService.cancelServiceBooking(req.user.id, id);
  }

  @ApiOperation({ summary: 'Get all booked schedules' })
  @ApiResponse({
    status: 200,
    description: 'Schedules fetched successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: [
          {
            scheduleId: '6995fbc5-7949-4dad-a42d-7bebfdb985e5',
            userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
            name: 'anil',
            email: 'nandhudevanand4419@gmail.com',
            phone: '9876543230',
            role: 'CLIENT',
            profileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
            serviceBookingId: '5586fd37-e090-472f-9e45-264f204ba31f',
            status: 'PENDING',
            date: '2027-01-13T00:00:00.000Z',
            timeshift: 'FULLDAY',
            cancelledAt: null,
            regionName: 'California',
            serviceId: '26c11b42-417c-4e37-8543-4ef609646718',
            servicePricingId: 'a06e7596-b571-4b20-ae57-0df58983f159',
            service: 'Birth Doula',
            doulaName: 'Andy gullit',
            doulaEmail: 'parasyadigitalhub@gmail.com',
            doulaProfileId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
            doulaUserId: 'a6a18005-37d9-4df3-89db-32ecc443f1b9',
            mainDoulaImage: null,
          },
          {
            scheduleId: '96941d70-8413-4ba1-90ea-cf145d11e2f2',
            userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
            name: 'anil',
            email: 'nandhudevanand4419@gmail.com',
            phone: '9876543230',
            role: 'CLIENT',
            profileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
            serviceBookingId: '99c343b0-82a9-4a6c-92ca-cbb67b98015f',
            status: 'PENDING',
            date: '2027-01-11T00:00:00.000Z',
            timeshift: 'FULLDAY',
            cancelledAt: null,
            regionName: 'California',
            serviceId: '26c11b42-417c-4e37-8543-4ef609646718',
            servicePricingId: 'a06e7596-b571-4b20-ae57-0df58983f159',
            service: 'Birth Doula',
            doulaName: 'Andy gullit',
            doulaEmail: 'parasyadigitalhub@gmail.com',
            doulaProfileId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
            doulaUserId: 'a6a18005-37d9-4df3-89db-32ecc443f1b9',
            mainDoulaImage: null,
          },
          {
            scheduleId: '79d748de-7b78-4c66-903b-5d8a00b051bf',
            userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
            name: 'anil',
            email: 'nandhudevanand4419@gmail.com',
            phone: '9876543230',
            role: 'CLIENT',
            profileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
            serviceBookingId: '8b662d3f-9b01-4152-a06b-2a2c26a2697b',
            status: 'PENDING',
            date: '2027-01-10T00:00:00.000Z',
            timeshift: 'FULLDAY',
            cancelledAt: null,
            regionName: 'California',
            serviceId: '41bb32e6-ae80-4a9c-8cd9-855f98ced1b2',
            servicePricingId: '6bf04639-948b-4302-ae6b-8ae5cf70033a',
            service: 'Post Partum Doula',
            doulaName: 'Andy gullit',
            doulaEmail: 'parasyadigitalhub@gmail.com',
            doulaProfileId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
            doulaUserId: 'a6a18005-37d9-4df3-89db-32ecc443f1b9',
            mainDoulaImage: null,
          },
        ],
      },
    },
  })
  @Get('schedules')
  async bookedSchedules(@Req() req) {
    return this.clientService.bookedSchedules(req.user.id);
  }

  // GET: Booked service by ID
  @ApiOperation({ summary: 'Get booked schedule by ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          scheduleId: '6995fbc5-7949-4dad-a42d-7bebfdb985e5',
          userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
          name: 'anil',
          email: 'nandhudevanand4419@gmail.com',
          phone: '9876543230',
          role: 'CLIENT',
          profileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
          serviceBookingId: '5586fd37-e090-472f-9e45-264f204ba31f',
          status: 'PENDING',
          date: '2027-01-13T00:00:00.000Z',
          timeshift: 'FULLDAY',
          regionName: 'California',
          serviceId: '26c11b42-417c-4e37-8543-4ef609646718',
          servicePricingId: 'a06e7596-b571-4b20-ae57-0df58983f159',
          service: 'Birth Doula',
          doulaName: 'Andy gullit',
          mainDoulaImage: null,
        },
      },
    },
  })
  @Get('schedules/:id')
  async bookedSchedulesbyId(@Req() req, @Param('id') id: string) {
    return this.clientService.bookedScheduleById(req.user.id, id);
  }

  // PATCH: Cancel service booking
  @ApiOperation({ summary: 'Cancel a booked schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule cancelled',
    schema: {
      example: {
        status: 'success',
        message: 'schedulescanceled successfully',
        data: {
          message: 'schedulescanceled successfully',
          serviceBookingId: '6995fbc5-7949-4dad-a42d-7bebfdb985e5',
          status: 'CANCELED',
        },
      },
    },
  })
  @Patch('schedules/:id/cancel')
  async cancelSchedules(@Req() req, @Param('id') id: string) {
    return this.clientService.cancelSchedules(req.user.id, id);
  }

  // MEETINGS
  // GET: All meetings
  @ApiOperation({ summary: 'Get all meetings' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: [
          {
            clientId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
            clientName: 'anil',
            clientEmail: 'nandhudevanand4419@gmail.com',
            clientPhone: '9876543230',
            clientProfileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
            meetingId: '27e06888-eee6-4e1f-aa28-063ff55f6616',
            meetingWith: 'ZONE_MANAGER',
            hostname: 'Manager North carolia',
            meetingDate: '2026-01-09T00:00:00.000Z',
            weekday: 'FRIDAY',
            startTime: '03:30',
            endTime: '04:00',
            link: 'https://bambinidoulas.com/joinmeeting//27e06888-eee6-4e1f-aa28-063ff55f6616',
            serviceName: 'Birth Doula',
            remarks: 'Looking for postpartum support during night hours.',
            status: 'SCHEDULED',
          },
          {
            clientId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
            clientName: 'anil',
            clientEmail: 'nandhudevanand4419@gmail.com',
            clientPhone: '9876543230',
            clientProfileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
            meetingId: '7f0850f8-d0fd-41a1-9f29-4a7feebfca80',
            meetingWith: 'ZONE_MANAGER',
            hostname: 'Manager North carolia',
            meetingDate: '2026-01-08T00:00:00.000Z',
            weekday: 'THURSDAY',
            startTime: '03:30',
            endTime: '04:00',
            link: 'https://bambinidoulas.com/joinmeeting//7f0850f8-d0fd-41a1-9f29-4a7feebfca80',
            serviceName: 'Birth Doula',
            remarks: 'Looking for postpartum support during night hours.',
            status: 'SCHEDULED',
          },
        ],
      },
    },
  })
  @Get('meetings')
  async getMeetings(@Req() req) {
    return this.clientService.Meetings(req.user.id);
  }

  // GET: Meeting by ID
  @ApiOperation({ summary: 'Get meeting by ID' })
  @ApiParam({ name: 'id', description: 'Meeting ID' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          clientId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
          clientName: 'anil',
          clientEmail: 'nandhudevanand4419@gmail.com',
          clientPhone: '9876543230',
          clientProfileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
          meetingId: '27e06888-eee6-4e1f-aa28-063ff55f6616',
          meetingWith: 'ZONE_MANAGER',
          hostname: 'Manager North carolia',
          meetingDate: '2026-01-09T00:00:00.000Z',
          weekday: 'FRIDAY',
          startTime: '03:30',
          endTime: '04:00',
          link: 'https://bambinidoulas.com/joinmeeting//27e06888-eee6-4e1f-aa28-063ff55f6616',
          serviceName: 'Birth Doula',
          remarks: 'Looking for postpartum support during night hours.',
          status: 'SCHEDULED',
          createdAt: '2026-01-08T13:22:09.542Z',
          cancelledAt: null,
          rescheduledAt: null,
        },
      },
    },
  })
  @Get('meetings/:id')
  async getMeetingById(@Req() req, @Param('id') id: string) {
    return this.clientService.meetingById(req.user.id, id);
  }

  // PATCH: Cancel meeting
  @ApiOperation({ summary: 'Cancel meeting' })
  @ApiParam({ name: 'id', description: 'Meeting ID' })
  @ApiResponse({
    status: 200,
    description: 'Meeting cancelled',
    schema: {
      example: {
        status: 'success',
        message: 'Meeting canceled successfully',
        data: {
          message: 'Meeting canceled successfully',
          meetingId: '27e06888-eee6-4e1f-aa28-063ff55f6616',
          status: 'CANCELED',
          cancelledAt: '2026-01-10T09:42:11.390Z',
        },
      },
    },
  })
  @Patch('meetings/:id/cancel')
  async cancelMeeting(@Req() req, @Param('id') id: string) {
    return this.clientService.cancelMeeting(req.user.id, id);
  }

  //  RECENT ACTIVITY
  // GET: Recent activity timeline
  @ApiOperation({ summary: 'Get recent activity timeline' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: [
          {
            type: 'BOOKING_CANCELED',
            title: 'Booking Canceled',
            description: 'You canceled your booking with Andy gullit',
            date: '2026-01-10T09:39:00.287Z',
          },
          {
            type: 'BOOKING_CREATED',
            title: 'New Booking Created',
            description: 'You booked Andy gullit',
            date: '2026-01-09T05:42:40.081Z',
          },
        ],
      },
    },
  })
  @Get('recent-activity')
  async getRecentActivity(@Req() req) {
    return this.clientService.recentActivity(req.user.id);
  }

  // PROFILE
  // GET: Client profile
  @ApiOperation({ summary: 'Get client profile' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
          name: 'anil',
          email: 'nandhudevanand4419@gmail.com',
          phone: '9876543230',
          profile_image: null,
          region: null,
          profileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
          address: null,
          memberSince: '2026-01-06T13:16:52.513Z',
        },
      },
    },
  })
  @Get('profile')
  async getProfile(@Req() req) {
    return this.clientService.profile(req.user.id);
  }

  @ApiOperation({ summary: 'Update client profile' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
          name: 'Jane Doe',
          email: 'nandhudevanand4419@gmail.com',
          phone: '9876543230',
          profileId: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
          profile_image: null,
          address: 'Street 12, Kochi, Kerala',
          region: 'Kochi, Kerala',
          memberSince: '2026-01-06T13:16:52.513Z',
        },
      },
    },
  })
  @Patch('profile')
  async updateProfile(@Req() req, @Body() dto: UpdateClientDto) {
    return this.clientService.updateProfile(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Upload client profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profile_image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Profile image uploaded successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Image uploaded successfully',
        data: {
          id: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
          userId: '8411173d-0d5b-4b02-8e8c-2812c109d102',
          is_verified: true,
          region: 'Kochi, Kerala',
          address: 'Street 12, Kochi, Kerala',
          profile_image: null,
          createdAt: '2026-01-06T13:16:52.513Z',
          updatedAt: '2026-01-10T09:43:52.395Z',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Patch('profile/images')
  @UseInterceptors(FileInterceptor('profile_image'))
  @ApiConsumes('multipart/form-data')
  async uploadDoulaImage(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Profile image is required');
    }

    const allowedImageTypes = ['image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 50MB per media

    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException('File is too large (max 10MB)');
    }
    const folder = 'uploads/clients/profile';
    const profileImageUrl = await this.s3Service.uploadFile(file, folder);
    return this.clientService.addClientProfileImage(
      req.user.id,
      profileImageUrl,
    );
  }

  @ApiOperation({ summary: 'Get client profile images' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: 'success',
        message: 'Client Profile Image fetched successfully',
        data: {
          id: '08eb5dfb-d9cd-412f-b6eb-a25e4509edc4',
          profile_image:
            'https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/clients/profile/1768038282936-nbqt80yispl.png',
        },
      },
    },
  })
  @Get('profile/images')
  async getDoulaImages(@Req() req) {
    return this.clientService.getClientProfileImages(req.user.id);
  }

  @ApiOperation({ summary: 'Delete client profile image' })
  @ApiResponse({
    status: 200,
    description: 'Profile image deleted',
    schema: {
      example: {
        status: 'success',
        message: 'Image deleted successfully',
        data: {
          message: 'Image deleted successfully',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Delete('profile/images/')
  async deleteDoulaImage(@Req() req) {
    return this.clientService.deleteClientProfileImage(req.user.id);
  }
}
