import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { FilterUserDto } from './filter-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Analytics')
@Controller({
  path: 'analytics',
  version: '1',
})
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @ApiOperation({
    summary: 'List users (paginated + optional role filter)',
    description:
      'Returns a paginated list of users. Use `page` and `limit` for pagination. Optionally filter by `role`.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by role (ADMIN, CLIENT, DOULA, ZONE_MANAGER)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Users fetched successfully',
        data: {
          items: [
            {
              id: 'uuid-1',
              name: 'Jane Doe',
              email: 'jane@example.com',
              role: 'CLIENT',
            },
            {
              id: 'uuid-2',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'ADMIN',
            },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  @Get('user/list')
  async listUsers(@Query() query: FilterUserDto) {
    return this.service.listUsers(query);
  }

  @ApiOperation({ summary: 'Get counts of users grouped by role' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Counts by role fetched',
        data: {
          ADMIN: 2,
          CLIENT: 120,
          DOULA: 8,
          ZONE_MANAGER: 3,
        },
      },
    },
  })
  @Get('counts/user')
  async getCounts() {
    return this.service.countUsersByRole();
  }

  @ApiOperation({ summary: 'Get counts of Active users grouped by role' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Active Counts by role fetched',
        data: {
          ADMIN: 2,
          CLIENT: 120,
          DOULA: 8,
          ZONE_MANAGER: 3,
        },
      },
    },
  })
  @Get('counts/active')
  async ActivegetCounts() {
    return this.service.ActivecountUsersByRole();
  }

  @ApiOperation({ summary: 'Get counts of Inactive users grouped by role' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Inactive Counts by role fetched',
        data: {
          ADMIN: 2,
          CLIENT: 120,
          DOULA: 8,
          ZONE_MANAGER: 3,
        },
      },
    },
  })
  @Get('counts/inactive')
  async inactivegetCounts() {
    return this.service.inactivecountUsersByRole();
  }

  @ApiOperation({ summary: 'Get booking statistics (aggregated)' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Booking stats fetched',
        data: {
          ACTIVE: 64,
          COMPLETED: 100,
          CANCELED: 4,
        },
      },
    },
  })
  @Get('counts/booking')
  async getStats() {
    return this.service.getBookingStats();
  }

  @ApiOperation({ summary: 'Get Meetings aggregated results' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Meetings stats fetched',
        data: {
          SCHEDULED: 12,
          COMPLETED: 5,
          CANCELED: 0,
        },
      },
    },
  })
  @Get('counts/meeting')
  async getMeetigStats() {
    return this.service.getMeetingstats();
  }

  @ApiOperation({ summary: 'Get Weekly / Daily Activity Analytics' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in YYYY-MM-DD format',
    example: '2025-11-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in YYYY-MM-DD format',
    example: '2025-11-07',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily activity statistics fetched successfully',
    schema: {
      example: {
        success: true,
        message: 'Weekly activity fetched',
        data: [
          {
            date: '2025-11-01',
            weekday: 'Sat',
            noOfBookings: 2,
            noOfMeetings: 1,
          },
          {
            date: '2025-11-02',
            weekday: 'Sun',
            noOfBookings: 0,
            noOfMeetings: 3,
          },
          {
            date: '2025-11-03',
            weekday: 'Mon',
            noOfBookings: 4,
            noOfMeetings: 2,
          },
          {
            date: '2025-11-04',
            weekday: 'Tue',
            noOfBookings: 3,
            noOfMeetings: 4,
          },
          {
            date: '2025-11-05',
            weekday: 'Wed',
            noOfBookings: 5,
            noOfMeetings: 6,
          },
          {
            date: '2025-11-06',
            weekday: 'Thu',
            noOfBookings: 7,
            noOfMeetings: 5,
          },
          {
            date: '2025-11-07',
            weekday: 'Fri',
            noOfBookings: 6,
            noOfMeetings: 8,
          },
        ],
      },
    },
  })
  @Get('daily-activity')
  async getDailyActivity(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getDailyActivity(startDate, endDate);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('calender/summary')
  async calenderSummary(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.calenderSummary(req.user.id, startDate, endDate);
  }
}
