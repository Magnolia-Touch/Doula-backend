import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ScheduleDoulaDto, UpdateClientDoulaEnquiryDto, UpdateMeetingStatusDto } from './dto/schedule-doula.dto';
import { cancelDto } from './dto/cancel.dto';
import { RescheduleDto } from './dto/reschedule.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@ApiTags('Meetings')
@ApiBearerAuth('bearer')
@Controller({
  path: 'meetings',
  version: '1',
})
export class MeetingsController {
  constructor(private readonly service: MeetingsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOULA, Role.ZONE_MANAGER)
  @ApiOperation({
    summary: 'Get meetings (filterable & paginated)',
    description:
      'Fetch meetings for the authenticated user. Admins can filter for all. Supports startDate/endDate/status/page/limit.',
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'SCHEDULED | COMPLETED | CANCELED',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": [
          {
            "meetingId": "505a0938-6169-4b6d-aaa9-90746d8847a0",
            "meetingLink": "https://meet.google.com/oo8cb355",
            "meetingStatus": "SCHEDULED",
            "meetingStartTime": "1970-01-01T03:30:00.000Z",
            "meetingEndTime": "1970-01-01T05:30:00.000Z",
            "meetingDate": "2025-12-06T00:00:00.000Z",
            "weekday": "SATURDAY",
            "serviceName": "Birth Doula",
            "remarks": "Looking for postpartum support during night hours.",
            "meeting_with": "ZONE_MANAGER",
            "enquiryId": null,
            "client": {
              "clientId": "6dd1d8f1-a75c-4d20-aa4c-44d36bcc7c03",
              "clientName": "John Doe",
              "clientEmail": "john.doe@example.com",
              "clientPhone": "9876543210"
            },
            "doula": null,
            "zoneManager": {
              "zoneManagerId": "55f12bf3-317f-4157-8aa0-0d979e3e8fa7",
              "zoneManagerProfileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
              "zoneManagerName": "Adam Smith",
              "zoneManagerEmail": "zonemanager@test.com"
            }
          },
          {
            "meetingId": "46c20c8e-5b15-4c2b-875b-90de4179f853",
            "meetingLink": "https://meet.google.com/p3rkoh0c",
            "meetingStatus": "SCHEDULED",
            "meetingStartTime": "1970-01-01T03:30:00.000Z",
            "meetingEndTime": "1970-01-01T05:30:00.000Z",
            "meetingDate": "2025-12-05T00:00:00.000Z",
            "weekday": "FRIDAY",
            "serviceName": "Birth Doula",
            "remarks": "Looking for postpartum support during night hours.",
            "meeting_with": "ZONE_MANAGER",
            "enquiryId": null,
            "client": {
              "clientId": "6dd1d8f1-a75c-4d20-aa4c-44d36bcc7c03",
              "clientName": "John Doe",
              "clientEmail": "john.doe@example.com",
              "clientPhone": "9876543210"
            },
            "doula": null,
            "zoneManager": {
              "zoneManagerId": "55f12bf3-317f-4157-8aa0-0d979e3e8fa7",
              "zoneManagerProfileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
              "zoneManagerName": "Adam Smith",
              "zoneManagerEmail": "zonemanager@test.com"
            }
          }
        ],
        "meta": {
          "total": 2,
          "page": 1,
          "limit": 10,
          "totalPages": 1,
          "hasNextPage": false,
          "hasPrevPage": false
        }
      }
    },
  })
  @Get()
  async getMeetings(
    @Query()
    params: {
      startDate?: string;
      endDate?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
    @Req() req,
  ) {
    return this.service.getMeetings(params, req.user);
  }


  // USE LESS API
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Post('doula/schedule')
  async scheduleDoulaMeeting(@Body() dto: ScheduleDoulaDto, @Req() req) {
    return this.service.doulasMeetingSchedule(dto, req.user);
  }


  // USE LESS API
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER, Role.DOULA)
  @Get('doula/schedule/list')
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.doulaMeeings(
      req.user.id,
      req.user.role,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }


  // USE LESS API
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER, Role.DOULA)
  @Patch('doula/schedule/list/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMeetingStatusDto,
    @Req() req: any,
  ) {
    return this.service.updateDoulaMeetingsStatus(
      id,
      req.user.id,
      req.user.role,
      dto.status,
    );
  }



  // USE LESS API
  @Get('doula/schedule/list/:id')
  findOne(@Param('id') id: string,) {
    return this.service.doulaMeeingsRetrieve(id,);
  }

  // USE LESS API
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Patch('doula/schedule/update/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDoulaEnquiryDto,
    @Req() req: any,
  ) {
    return this.service.updateDoulaMeeting(id, dto, req.user.id);
  }

  // USE LESS API
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Delete('doula/schedule/delete/:id')
  remove(@Param('id') id: string, @Req() req: any,) {
    return this.service.deleteDoulaMeeting(id, req.user.id);
  }


  // USE LESS API
  @Post('reschedule')
  async rescheduleMeeting(@Body() dto: RescheduleDto, @Req() req) {
    return this.service.rescheduleMeeting(dto, req.user);
  }

  // UPDATE MEETING STATUS
  @ApiOperation({ summary: 'Update meeting status (ZM/DOULA)' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Meeting status updated",
        "data": {
          "message": "Meeting status updated",
          "meeting": {
            "id": "066ceafa-596f-4cb7-9d99-9747fe411c71",
            "link": "https://meet.test/zm-2027-12-23",
            "status": "COMPLETED",
            "startTime": "1970-01-01T10:00:00.000Z",
            "endTime": "1970-01-01T11:00:00.000Z",
            "date": "2027-12-23T00:00:00.000Z",
            "serviceName": "Zone Manager Consultation",
            "remarks": null,
            "bookedById": "77b9176a-6cb0-4360-bdb8-207c1d12962d",
            "createdAt": "2025-12-22T07:42:29.787Z",
            "updatedAt": "2025-12-23T07:50:20.031Z",
            "cancelledAt": null,
            "rescheduledAt": null,
            "availableSlotsForMeetingId": null,
            "zoneManagerProfileId": "8d749262-267e-47e7-a53f-26916c0b91be",
            "doulaProfileId": null,
            "adminProfileId": null,
            "serviceId": "7bfca5a5-f198-4b0d-a681-f0367fda7f17"
          }
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA, Role.ZONE_MANAGER)
  @Patch('status')
  async updateMeetingStatus(@Body() dto: UpdateStatusDto, @Req() req) {
    return this.service.updateMeetingStatus(dto, req.user.id);
  }

  // DELETE ALL MEETINGS (ONLY ADMIN)
  //USE LESS API
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete all meetings (Admin only)' })
  @Delete('delete-all')
  async deleteAllMeetings(@Req() req) {
    return this.service.deleteAllMeetings(req.user);
  }

  //USE LESS API
  @Get('all/meetings')
  async getAllMeetings() {
    return this.service.findAllmeetings();
  }

  @Get('booked/slots')
  @ApiQuery({ name: 'date', required: true, example: '2025-02-12' })
  @ApiQuery({ name: 'doulaProfileId', required: false })
  @ApiQuery({ name: 'zoneManagerProfileId', required: false })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "date": "2025-12-21",
          "totalBookedSlots": 1,
          "bookings": [
            {
              "meetingDate": "2025-12-21T00:00:00.000Z",
              "startTime": "1970-01-01T05:30:00.000Z",
              "endTime": "1970-01-01T05:30:00.000Z"
            }
          ]
        }
      }
    },
  })
  async getBookedMeetingsByDate(
    @Query('date') date: string,
    @Query('doulaProfileId') doulaProfileId?: string,
    @Query('zoneManagerProfileId') zoneManagerProfileId?: string,
  ) {
    if (!date) {
      throw new BadRequestException('date is required');
    }

    if (!doulaProfileId && !zoneManagerProfileId) {
      throw new BadRequestException(
        'Either doulaProfileId or zoneManagerProfileId is required',
      );
    }

    if (doulaProfileId && zoneManagerProfileId) {
      throw new BadRequestException(
        'Provide only one: doulaProfileId OR zoneManagerProfileId',
      );
    }

    return this.service.getBookedMeetingsByDate({
      date,
      doulaProfileId,
      zoneManagerProfileId,
    });
  }

  // GET SINGLE MEETING
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOULA, Role.ZONE_MANAGER)
  @ApiOperation({ summary: 'Get meeting by ID' })
  @ApiParam({ name: 'id', description: 'Meeting UUID' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "meetingId": "505a0938-6169-4b6d-aaa9-90746d8847a0",
          "meetingLink": "https://meet.google.com/oo8cb355",
          "meetingStatus": "SCHEDULED",
          "meetingStartTime": "1970-01-01T03:30:00.000Z",
          "meetingEndTime": "1970-01-01T05:30:00.000Z",
          "meetingDate": "2025-12-06T00:00:00.000Z",
          "weekday": "SATURDAY",
          "serviceName": "Birth Doula",
          "remarks": "Looking for postpartum support during night hours.",
          "meeting_with": "ZONE_MANAGER",
          "enquiryId": null,
          "client": {
            "clientId": "6dd1d8f1-a75c-4d20-aa4c-44d36bcc7c03",
            "clientName": "John Doe",
            "clientEmail": "john.doe@example.com",
            "clientPhone": "9876543210"
          },
          "doula": null,
          "zoneManager": {
            "zoneManagerId": "55f12bf3-317f-4157-8aa0-0d979e3e8fa7",
            "zoneManagerProfileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
            "zoneManagerName": "Adam Smith",
            "zoneManagerEmail": "zonemanager@test.com"
          }
        }
      }
    },
  })
  @Get(':id')
  async getMeetingById(@Param('id') id: string, @Req() req) {
    return this.service.getMeetingById(id, req.user);
  }


  @Post("schedule/doula-client")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  async createMeeting(
    @Body() dto: CreateMeetingDto,
    @Req() req,
  ) {
    return this.service.createMeetingForClientAndDoula(dto, req.user.id);
  }
}
