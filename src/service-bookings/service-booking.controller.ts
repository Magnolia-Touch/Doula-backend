import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import { GetMeetingsQueryDto } from './dto/get-meetings.query.dto';
import { GetSchedulesQueryDto } from './dto/get-schedules.query.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';

@ApiTags('Service Bookings')
@Controller({
  path: 'service-booked',
  version: '1',
})
export class ServiceBookingController {
  constructor(private readonly bookingService: ServiceBookingService) {}

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
  async findAll(
    @Query() query: BookingFilterDto & { page?: string; limit?: string },
  ) {
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
  @ApiOperation({
    summary: 'Update schedule status',
    description:
      'Allows Doula, Zone Manager, or Admin to update the status of a specific schedule',
  })
  @ApiParam({
    name: 'id',
    description: 'Schedule UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule status updated successfully',
    type: SwaggerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status update' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
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
  @ApiOperation({
    summary: 'Update booking status',
    description:
      'Allows Doula, Zone Manager, or Admin to update the status of a booking',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking status updated successfully',
    type: SwaggerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status update' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
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

  @Get('meetings/list/admin')
  @ApiOperation({
    summary: 'Get all meetings (Admin)',
    description: 'Returns paginated list of all meetings across the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Meetings fetched successfully',
    type: SwaggerResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('meetings/list/admin')
  async getAllMeetings(@Query() query: GetMeetingsQueryDto) {
    return this.bookingService.getAllMeetings(query);
  }

  @Get('meetings/list/admin/:id')
  @ApiOperation({
    summary: 'Get meeting by ID (Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'Meeting UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Meeting fetched successfully',
    type: SwaggerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meeting not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('meetings/list/admin/:id')
  async getMeetingById(@Param('id') id: string) {
    return this.bookingService.getMeetingById(id);
  }

  @Get('schedules/list/admin')
  @ApiOperation({
    summary: 'Get all schedules (Admin)',
    description: 'Returns all schedules with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedules fetched successfully',
    type: SwaggerResponseDto,
  })
  getAllSchedules(@Query() query: GetSchedulesQueryDto) {
    return this.bookingService.getAllSchedules(query);
  }

  /* ----------------------------------------------------
   * GET /schedules/:id
   * -------------------------------------------------- */
  @Get('schedules/list/admin/:id')
  @ApiOperation({
    summary: 'Get schedule by ID (Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'Schedule UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule fetched successfully',
    type: SwaggerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  getScheduleById(@Param('id') id: string) {
    return this.bookingService.getScheduleById(id);
  }

  @Get('testimonials/list/admin/')
  @ApiOperation({
    summary: 'Get all testimonials (Admin)',
    description: 'Returns paginated list of all testimonials',
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonials fetched successfully',
    type: SwaggerResponseDto,
  })
  async getTestimonials(@Query() query: GetTestimonialsDto) {
    return this.bookingService.getAllTestimonial(query);
  }

  @Get('testimonials/list/admin/:id')
  @ApiOperation({
    summary: 'Get testimonial by ID (Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'Testimonial UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonial fetched successfully',
    type: SwaggerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  async getById(@Param('id') id: string) {
    return this.bookingService.getById(id);
  }
}
