import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { FilterUserDto } from './dto/filter-user.dto';
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
import { UserCountDto } from './dto/user-count.dto';

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
        status: 'success',
        message: 'Request successful',
        data: [
          {
            id: 'a6a18005-37d9-4df3-89db-32ecc443f1b9',
            name: 'Andy gullit',
            email: 'parasyadigitalhub@gmail.com',
            phone: '2348735882',
            otp: null,
            otpExpiresAt: null,
            role: 'DOULA',
            is_active: true,
            createdAt: '2026-01-07T04:46:13.668Z',
            updatedAt: '2026-01-09T05:14:16.370Z',
            clientProfile: null,
            doulaProfile: {
              id: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
              userId: 'a6a18005-37d9-4df3-89db-32ecc443f1b9',
              regionId: null,
              profile_image: null,
              description: 'this is my description',
              achievements: 'nil',
              qualification: 'plus two',
              yoe: 4,
              languages: ['Hindi', 'English'],
              specialities: ['Prenatal Care', 'Postpartum Support'],
              createdAt: '2026-01-07T04:46:13.668Z',
              updatedAt: '2026-01-07T04:46:13.668Z',
              Region: [
                {
                  id: '35124707-c367-4148-8ac7-ff080f93ab82',
                  regionName: 'California',
                },
                {
                  id: '393d86a0-4b42-400d-82de-6d7d6331bd8e',
                  regionName: 'Virginia',
                },
                {
                  id: '5319c4b5-b393-4245-becd-c8084582fe1a',
                  regionName: 'North Carolina',
                },
                {
                  id: '79ca23b7-4110-402e-9d0d-f32ec4212b53',
                  regionName: 'Ohio',
                },
                {
                  id: 'aa3eb5eb-89cc-4209-a6ef-0f510bfe4e12',
                  regionName: 'Florida',
                },
                {
                  id: 'fc367292-a174-4670-b455-7a5d429a4cba',
                  regionName: 'NY',
                },
                {
                  id: 'fdbebc0d-aac5-4c40-80f7-d3cbfb520033',
                  regionName: 'Texas',
                },
              ],
            },
            zonemanagerprofile: null,
            adminProfile: null,
          },
        ],
        meta: {
          total: 7,
          page: 1,
          limit: 1,
          totalPages: 7,
          hasNextPage: true,
          hasPrevPage: false,
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ZONE_MANAGER)
  @Get('user/list')
  async listUsers(@Query() query: FilterUserDto, @Req() req) {
    console.log('id', req.user.id);
    console.log('role', req.user.role);
    return this.service.listUsers(query, req.user.id, req.user.role);
  }

  @ApiOperation({ summary: 'Get counts of users grouped by role' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          total: 20,
          counts: {
            admins: 2,
            zonemanagers: 4,
            doulas: 7,
            clients: 7,
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ZONE_MANAGER)
  @Get('counts/user')
  async getCounts(@Query() query: UserCountDto, @Req() req) {
    return this.service.countUsersByRole(query, req.user.id, req.user.role);
  }

  @ApiOperation({ summary: 'Get counts of Active users grouped by role' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          total: 98,
          counts: {
            ACTIVE: 26,
            COMPLETED: 1,
            CANCELED: 0,
            PENDING: 71,
          },
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

  @ApiOperation({ summary: 'Get booking statistics' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          total: 98,
          counts: {
            ACTIVE: 26,
            COMPLETED: 1,
            CANCELED: 0,
            PENDING: 71,
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ZONE_MANAGER)
  @Get('counts/booking')
  async getStats(@Query('regionId') regionId: string, @Req() req) {
    return this.service.getBookingStats(req.user.id, req.user.role, regionId);
  }

  @ApiOperation({ summary: 'Get Meetings aggregated results' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          total: 9,
          counts: {
            SCHEDULED: 9,
            COMPLETED: 0,
            CANCELED: 0,
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ZONE_MANAGER)
  @Get('counts/meeting')
  async getMeetigStats(@Query('regionId') regionId: string, @Req() req) {
    return this.service.getMeetingStats(req.user.id, req.user.role, regionId);
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
        status: 'success',
        message: 'Request successful',
        data: [
          {
            date: '2025-12-28',
            weekday: 'Sun',
            noOfBookings: 7,
            noOfMeetings: 0,
          },
          {
            date: '2025-12-30',
            weekday: 'Tue',
            noOfBookings: 1,
            noOfMeetings: 0,
          },
          {
            date: '2026-01-01',
            weekday: 'Thu',
            noOfBookings: 35,
            noOfMeetings: 0,
          },
          {
            date: '2026-01-02',
            weekday: 'Fri',
            noOfBookings: 0,
            noOfMeetings: 4,
          },
          {
            date: '2026-01-03',
            weekday: 'Sat',
            noOfBookings: 1,
            noOfMeetings: 0,
          },
          {
            date: '2026-01-06',
            weekday: 'Tue',
            noOfBookings: 8,
            noOfMeetings: 1,
          },
          {
            date: '2026-01-07',
            weekday: 'Wed',
            noOfBookings: 25,
            noOfMeetings: 0,
          },
          {
            date: '2026-01-08',
            weekday: 'Thu',
            noOfBookings: 16,
            noOfMeetings: 4,
          },
          {
            date: '2026-01-09',
            weekday: 'Fri',
            noOfBookings: 5,
            noOfMeetings: 0,
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

  @ApiOperation({ summary: 'Get Calender Summary' })
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
        status: 'success',
        message: 'Request successful',
        data: [
          {
            date: '2025-12-05',
            appointmentCount: 1,
            scheduleCount: 0,
          },
          {
            date: '2025-12-08',
            appointmentCount: 1,
            scheduleCount: 0,
          },
          {
            date: '2025-12-31',
            appointmentCount: 1,
            scheduleCount: 0,
          },
          {
            date: '2025-12-06',
            appointmentCount: 1,
            scheduleCount: 0,
          },
          {
            date: '2025-12-07',
            appointmentCount: 1,
            scheduleCount: 0,
          },
        ],
      },
    },
  })
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

  @ApiOperation({ summary: 'Get Calender Summary' })
  @ApiQuery({
    name: 'date1',
    required: false,
    type: String,
    description: 'Start date in YYYY-MM-DD format',
    example: '2025-11-01',
  })
  @ApiQuery({
    name: 'date2',
    required: false,
    type: String,
    description: 'End date in YYYY-MM-DD format',
    example: '2025-11-07',
  })
  @ApiQuery({
    name: 'duolaId',
    required: false,
    type: String,
    description: 'Doula profile id',
  })
  @ApiQuery({
    name: 'regionId',
    required: false,
    type: String,
    description: 'uuid of region',
  })
  @ApiQuery({
    name: 'servideId',
    required: false,
    type: String,
    description: 'General service Id',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily activity statistics fetched successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Total revenue calculated successfully',
        data: {
          message: 'Total revenue calculated successfully',
          filtersApplied: {
            doulaId: null,
            regionId: null,
            serviceId: null,
            date1: null,
            date2: null,
          },
          totalRevenue: 2720,
          currency: 'INR',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('revenue/total')
  async getTotalRevenue(
    @Query('doulaId') doulaId?: string,
    @Query('regionId') regionId?: string,
    @Query('serviceId') serviceId?: string, // Service table ID
    @Query('date1') date1?: string,
    @Query('date2') date2?: string,
  ) {
    return this.service.getTotalRevenue({
      doulaId,
      regionId,
      serviceId,
      date1,
      date2,
    });
  }
}
