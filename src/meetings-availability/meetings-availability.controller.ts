import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
  Get,
  Patch,
} from '@nestjs/common';
import { AvailableSlotsService } from './meetings-availability.service';
import {
  AvailableSlotsForMeetingDto,
  UpdateSlotsForMeetingTimeDto,
} from './dto/meeting-avail.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { toUTCDate } from 'src/common/utility/service-utils';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { MarkOffDaysDto } from './dto/off-days.dto';
import { GetAvailabilityDto } from './dto/get-availability.dto';

@ApiTags('Meeting Slots')
@ApiBearerAuth('bearer')
@Controller({
  path: 'slots',
  version: '1',
})
export class AvailableSlotsController {
  constructor(private readonly service: AvailableSlotsService) {}

  // CREATE SLOTS
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create availability slots (one or many time ranges per date)',
  })
  @ApiBody({ type: AvailableSlotsForMeetingDto, isArray: true })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Slots created successfully',
        data: {
          date: '2025-12-12T00:00:00.000Z',
          ownerRole: 'ZONE_MANAGER',
          timeslot: {
            startTime: '2025-12-12T13:30:00.000Z',
            endTime: '2025-12-12T14:30:00.000Z',
            available: true,
            is_booked: false,
          },
        },
      },
    },
  })
  @Post()
  async createSlots(@Body() dto: AvailableSlotsForMeetingDto, @Req() req) {
    // note: your service probably accepts either single or multiple; adjust call accordingly
    return this.service.createAvailability(dto, req.user);
  }

  //USELESSAPI
  @Get()
  async getAllSlots(
    @Query('regionId') regionId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('filter') filter: 'all' | 'booked' | 'unbooked' = 'all',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    if (!regionId) throw new BadRequestException('regionId is required');
    if (!startDate) throw new BadRequestException('startDate is required');
    if (!endDate) throw new BadRequestException('endDate is required');

    return this.service.getAllSlots(
      regionId,
      startDate,
      endDate,
      filter,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slot by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Slot retrieved successfully',
        data: {
          message: 'Slot retrieved successfully',
          slot: {
            id: '486a10f6-3183-4d9d-9078-b88736672e97',
            date: '2025-12-04T00:00:00.000Z',
            weekday: 'Friday',
            availabe: true,
            ownerRole: 'ZONE_MANAGER',
            doulaId: null,
            adminId: null,
            zoneManagerId: 'f614863a-f3c5-479b-b50f-237764e34d18',
            createdAt: '2025-11-26T10:18:00.959Z',
            updatedAt: '2025-11-26T10:18:00.959Z',
            AvailableSlotsTimeForMeeting: [
              {
                id: 'a7c558e2-eca1-4288-a118-e5448314e9f2',
                startTime: '2025-12-05T11:30:00.000Z',
                endTime: '2025-12-05T13:30:00.000Z',
                availabe: true,
                isBooked: false,
                createdAt: '2025-11-26T10:18:00.962Z',
                updatedAt: '2025-11-26T10:18:00.962Z',
                dateId: '486a10f6-3183-4d9d-9078-b88736672e97',
              },
            ],
          },
        },
      },
    },
  })
  async getSlotById(@Param('id') id: string) {
    return this.service.getSlotById(id);
  }

  // Update slot (time)ff
  @UseGuards(JwtAuthGuard)
  @Roles('ZONE_MANAGER', 'ADMIN', 'DOULA')
  @ApiOperation({ summary: 'Update a timeslot (start/end) or its metadata' })
  @ApiBody({ type: UpdateSlotsForMeetingTimeDto })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Time slot updated successfully',
        data: {
          id: 'a7c558e2-eca1-4288-a118-e5448314e9f2',
          startTime: '2025-12-03T22:30:00.000Z',
          endTime: '2025-12-03T21:30:00.000Z',
          availabe: true,
          isBooked: false,
          createdAt: '2025-11-26T10:18:00.962Z',
          updatedAt: '2025-11-26T11:07:33.738Z',
          dateId: '486a10f6-3183-4d9d-9078-b88736672e97',
        },
      },
    },
  })
  @Patch()
  async updateSlot(@Body() dto: UpdateSlotsForMeetingTimeDto, @Req() req) {
    return this.service.updateSlotTimeById(dto, req.user.id);
  }

  // DELETE slot
  @UseGuards(JwtAuthGuard)
  @Roles('ZONE_MANAGER', 'ADMIN', 'DOULA')
  @ApiOperation({ summary: 'Delete a date-slot (and its time entries)' })
  @ApiParam({ name: 'slotId', description: 'Date slot id' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Slot Deleted Successfully',
        data: {
          message: 'Slot Deleted Successfully',
        },
      },
    },
  })
  @Delete(':slotId')
  async deleteSlot(@Param('slotId') slotId: string, @Req() req) {
    return this.service.deleteSlots(slotId, req.user.id);
  }

  @Patch('mark/availability/:id')
  async updateSlotAvail(
    @Param('id') id: string,
    @Body('booked') booked: boolean,
    @Body('availabe') availabe: boolean,
  ) {
    return this.service.updateTimeSlotAvailability(id, booked, availabe);
  }

  // Get SLOT (filtered)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ZONE_MANAGER, Role.DOULA)
  @ApiOperation({ summary: 'Get slots for a region between dates' })
  @ApiQuery({ name: 'regionId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'all | booked | unbooked',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: [
          {
            dateId: '19a6cadc-e522-46d9-a280-156079e3ab84',
            date: '2025-12-01T00:00:00.000Z',
            weekday: 'Monday',
            availabe: true,
            ownerRole: 'ZONE_MANAGER',
            adminId: null,
            doulaId: null,
            zoneManagerId: '09bde013-60db-4934-b906-9ecf1acab7da',
            createdAt: '2025-12-06T10:52:12.694Z',
            updatedAt: '2025-12-06T10:52:12.694Z',
            timings: [
              {
                timeId: '4ca1edc4-0587-47c0-96fb-a35c66c0e4fc',
                startTime: '2025-12-01T03:30:00.000Z',
                endTime: '2025-12-01T10:30:00.000Z',
                availabe: true,
                isBooked: false,
              },
            ],
          },
          {
            dateId: '2c08d8e8-302b-4bca-9f95-a15ccd2d44b1',
            date: '2025-12-02T00:00:00.000Z',
            weekday: 'Tuesday',
            availabe: true,
            ownerRole: 'ZONE_MANAGER',
            adminId: null,
            doulaId: null,
            zoneManagerId: '09bde013-60db-4934-b906-9ecf1acab7da',
            createdAt: '2025-12-06T10:52:41.435Z',
            updatedAt: '2025-12-06T10:52:41.435Z',
            timings: [
              {
                timeId: 'bcf5fbbf-f9f0-4095-87ce-da0b0fb9100a',
                startTime: '2025-12-02T03:30:00.000Z',
                endTime: '2025-12-02T10:30:00.000Z',
                availabe: true,
                isBooked: false,
              },
            ],
          },
          {
            dateId: '0895879c-eed0-4b2b-a3f4-5e85600b450d',
            date: '2025-12-03T00:00:00.000Z',
            weekday: 'Wednesday',
            availabe: true,
            ownerRole: 'ZONE_MANAGER',
            adminId: null,
            doulaId: null,
            zoneManagerId: '09bde013-60db-4934-b906-9ecf1acab7da',
            createdAt: '2025-12-06T10:53:04.967Z',
            updatedAt: '2025-12-06T10:53:04.967Z',
            timings: [
              {
                timeId: '129009f7-d549-40a7-a33f-277bdb53f62d',
                startTime: '2025-12-03T03:30:00.000Z',
                endTime: '2025-12-03T10:30:00.000Z',
                availabe: true,
                isBooked: false,
              },
            ],
          },
          {
            dateId: '832838dc-9b60-4c3d-8efd-4eb3ad4be400',
            date: '2025-12-04T00:00:00.000Z',
            weekday: 'Thursday',
            availabe: true,
            ownerRole: 'ZONE_MANAGER',
            adminId: null,
            doulaId: null,
            zoneManagerId: '09bde013-60db-4934-b906-9ecf1acab7da',
            createdAt: '2025-12-06T10:53:07.764Z',
            updatedAt: '2025-12-06T10:53:07.764Z',
            timings: [
              {
                timeId: '9e5ca7ef-b74b-4002-a37e-0568d2250fe7',
                startTime: '2025-12-04T03:30:00.000Z',
                endTime: '2025-12-04T10:30:00.000Z',
                availabe: true,
                isBooked: false,
              },
              {
                timeId: 'e9e2c126-84f5-4465-a9a4-5e132606b444',
                startTime: '2025-12-04T11:30:00.000Z',
                endTime: '2025-12-04T13:30:00.000Z',
                availabe: true,
                isBooked: false,
              },
            ],
          },
        ],
        meta: {
          total: 4,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    },
  })
  @Get('my/availability')
  async findall(@Req() req) {
    return this.service.getMyAvailabilities(req.user.id);
  }

  // Get SLOT (filtered)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER, Role.DOULA)
  @Post('mark/offdays')
  async markOffDays(@Req() req, @Body() dto: MarkOffDaysDto) {
    return this.service.markOffDays(req.user, dto);
  }

  // Get SLOT (filtered)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER, Role.DOULA)
  @Post('mark/offdays')
  @ApiOperation({
    summary: 'Mark off-days for a doula or zone manager',
    description:
      'Marks one or more dates as unavailable (off-days) for the logged-in user',
  })
  @ApiBody({ type: MarkOffDaysDto })
  @ApiResponse({
    status: 201,
    description: 'Off-days marked successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          count: 4,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async fetchOffDays(@Req() req) {
    return this.service.fetchOffdays(req.user.id);
  }

  // Get SLOT (filtered)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER, Role.DOULA)
  @Get('mark/offdays/:id')
  async fetchOffdaysbyid(@Req() req, @Param('id') id: string) {
    return this.service.fetchOffdaysbyid(req.user.id, id);
  }

  // Get SLOT (filtered)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER, Role.DOULA)
  @Delete('mark/offdays/:id')
  async DeleteOffdaysbyid(@Req() req, @Param('id') id: string) {
    return this.service.DeleteOffdaysbyid(req.user.id, id);
  }

  // Get SLOT (filtered)

  @Get('meetings/availability')
  @ApiOperation({
    summary: 'Get doula availability',
    description:
      'Returns availability of doulas for given region and date filters',
  })
  @ApiQuery({
    name: 'regionId',
    required: true,
    description: 'Region ID',
  })
  @ApiQuery({
    name: 'date1',
    required: true,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'date2',
    required: false,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'weekday',
    required: false,
    description: 'Weekday filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability fetched successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: [
          {
            date: '2025-09-01T00:00:00.000Z',
            weekday: 'MONDAY',
            timeslots: [
              {
                startTime: '09:00:00',
                endTime: '11:00:00',
              },
            ],
          },
        ],
      },
    },
  })
  async ZmgetAvailablility(
    @Query('regionId') regionId: string,
    @Query() dto: GetAvailabilityDto,
  ) {
    return this.service.ZmgetAvailablility(regionId, dto);
  }

  @Get('meetings/timeslots')
  @ApiOperation({
    summary: 'Get split time slots',
    description: 'Splits available time slots based on region and date filters',
  })
  @ApiQuery({
    name: 'regionId',
    required: true,
    description: 'Region ID',
  })
  @ApiQuery({
    name: 'date1',
    required: true,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'date2',
    required: false,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'weekday',
    required: false,
    description: 'Weekday filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Time slots fetched successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: [
          {
            date: '2025-09-01T00:00:00.000Z',
            weekday: 'MONDAY',
            timeslots: [
              {
                startTime: '09:00:00',
                endTime: '09:30:00',
              },
              {
                startTime: '09:30:00',
                endTime: '10:00:00',
              },
              {
                startTime: '10:00:00',
                endTime: '10:30:00',
              },
              {
                startTime: '10:30:00',
                endTime: '11:00:00',
              },
            ],
          },
        ],
      },
    },
  })
  async splitTimeslots(
    @Query('regionId') regionId: string,
    @Query() dto: GetAvailabilityDto,
  ) {
    return this.service.splitTimeslots(regionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:timeslotId')
  @ApiOperation({
    summary: 'Delete time slot availability',
  })
  @ApiParam({
    name: 'timeslotId',
    description: 'Time slot ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Time slot deleted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Time Slot Deleted Successfully',
        data: {
          message: 'Time Slot Deleted Successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Time slot not found' })
  async deleteTimeSlotAvailability(
    @Param('timeslotId') timeslotId: string,
    @Req() req,
  ) {
    return this.service.deleteTimeSlotAvailability(timeslotId);
  }
}
