import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ServiceBookingService } from './service-booking.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role, ServiceStatus } from '@prisma/client';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingFilterDto } from './dto/bookings-filter.dto';

@ApiTags('Service Bookings')
@Controller({
  path: 'service-booked',
  version: '1',
})
export class ServiceBookingController {
  constructor(private readonly bookingService: ServiceBookingService) { }

  @ApiOperation({ summary: 'Get all service bookings' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Bookings fetched',
        data: [
          {
            id: 'booking-1',
            service: { id: 'service-1', name: 'Prenatal Visit' },
            client: { id: 'client-1', name: 'Ravi Kumar' },
            doula: { id: 'doula-1', name: 'Neeta' },
            slot: { id: 'slot-1', date: '2025-12-01', startTime: '14:00' },
            status: 'CONFIRMED',
            createdAt: '2025-11-20T10:00:00.000Z',
          },
        ],
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async findAll(@Query() query: BookingFilterDto & { page?: string; limit?: string }) {
    return this.bookingService.findAll({
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      isPaid:
        query.isPaid !== undefined
          ? (query.isPaid as any) === 'true'
          : undefined,
    });
  }



  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Booking fetched',
        data: {
          id: 'booking-1',
          service: { id: 'service-1', name: 'Prenatal Visit' },
          client: {
            id: 'client-1',
            name: 'Ravi Kumar',
            phone: '+919876543210',
          },
          doula: { id: 'doula-1', name: 'Neeta' },
          slot: { id: 'slot-1', date: '2025-12-01', startTime: '14:00' },
          status: 'CONFIRMED',
          payment: {
            id: 'pay-1',
            amount: 1200,
            currency: 'INR',
            status: 'PAID',
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  getBookingById(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Patch('schedules/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA, Role.ZONE_MANAGER, Role.ADMIN)
  async updateScheduleStatus(
    @Req() req,
    @Param('id') scheduleId: string,
    @Body() dto: UpdateScheduleStatusDto,
  ) {
    return this.bookingService.updateScheduleStatus(
      req.user.id,
      req.user.role,
      scheduleId,
      dto,
    );
  }

  @Patch('bookings/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA, Role.ZONE_MANAGER, Role.ADMIN)
  async updateBookingStatus(
    @Req() req,
    @Param('id') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingService.updateBookingStatus(
      req.user.id,
      req.user.role,
      bookingId,
      dto,
    );
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ZONE_MANAGER)
  // @Get('schedules/list')
  // async getSchedules(
  //   @Req() req: any,
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  //   @Query('status') status?: ServiceStatus,
  //   @Query('search') search?: string,
  //   @Query('date') date?: string,
  //   @Query('serviceName') serviceName?: string,

  // ) {
  //   return this.bookingService.getZoneManagerSchedules(
  //     req.user.id,
  //     Number(page) || 1,
  //     Number(limit) || 10,
  //     {
  //       serviceName,
  //       status,
  //       search,
  //       date,
  //     },
  //   );
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ZONE_MANAGER)
  // @Get('meetings/list')
  // async getZoneManagerMeetings(
  //   @Req() req: any,
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  //   @Query('search') search?: string,
  //   @Query('status') status?: MeetingStatus,
  // ) {
  //   return this.service.getZoneManagerMeetings(
  //     req.user.id,
  //     Number(page) || 1,
  //     Number(limit) || 10,
  //     search?.trim(),
  //     status,
  //   );
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ZONE_MANAGER)
  // @Get('schedules/list/:id')
  // async getScheduleById(@Req() req: any, @Param('id') id: string) {
  //   return this.service.getZoneManagerScheduleById(req.user.id, id);
  // }


  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ZONE_MANAGER)
  // @Get('meetings/list/:id')
  // async getMeetingById(@Req() req: any, @Param('id') id: string) {
  //   return this.service.getZoneManagerMeetingById(req.user.id, id);
  // }

}
