import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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

@ApiTags('Analytics')
@Controller({
    path: 'analytics',
    version: '1',
})
export class AnalyticsController {
    constructor(private service: AnalyticsService) { }

    @ApiOperation({
        summary: 'List users (paginated + optional role filter)',
        description:
            'Returns a paginated list of users. Use `page` and `limit` for pagination. Optionally filter by `role`.',
    })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
    @ApiQuery({ name: 'role', required: false, description: 'Filter by role (ADMIN, CLIENT, DOULA, ZONE_MANAGER)', type: String })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Users fetched successfully',
                data: {
                    items: [
                        { id: 'uuid-1', name: 'Jane Doe', email: 'jane@example.com', role: 'CLIENT' },
                        { id: 'uuid-2', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' }
                    ],
                    total: 2,
                    page: 1,
                    limit: 10,
                },
            },
        },
    })
    @Get()
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
    @Get('counts')
    async getCounts() {
        return this.service.countUsersByRole();
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
                    totalBookings: 320,
                    bookingsThisMonth: 24,
                    completedBookings: 290,
                    cancelledBookings: 30,
                    bookingsByService: {
                        'prenatal-care': 120,
                        'postnatal-care': 200
                    }
                },
            },
        },
    })
    @Get('stats')
    async getStats() {
        return this.service.getBookingStats();
    }
}
