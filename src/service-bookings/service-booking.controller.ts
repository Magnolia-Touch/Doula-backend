import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ServiceBookingService } from './service-booking.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

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
  @Get()
  async findAll(
    @Query() query: { page?: string; limit?: string; status?: string },
  ) {
    return this.bookingService.findAll({
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      status: query.status,
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
  @Get(':id')
  getBookingById(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Patch('schedules/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  async updateScheduleStatus(
    @Req() req,
    @Param('id') scheduleId: string,
    @Body() dto: UpdateScheduleStatusDto,
  ) {
    return this.bookingService.updateScheduleStatus(
      req.user.id,
      scheduleId,
      dto,
    );
  }

  @Patch('bookings/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  async updateBookingStatus(
    @Req() req,
    @Param('id') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingService.updateBookingStatus(
      req.user.id,
      bookingId,
      dto,
    );
  }

}
