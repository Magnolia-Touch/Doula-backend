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

@ApiTags('Meeting Slots')
@ApiBearerAuth('bearer')
@Controller({
    path: 'slots',
    version: '1',
})
export class AvailableSlotsController {
    constructor(private readonly service: AvailableSlotsService) { }

    // CREATE SLOTS
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create availability slots (one or many time ranges per date)' })
    @ApiBody({ type: AvailableSlotsForMeetingDto, isArray: true })
    @ApiResponse({
        status: 201,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Slots created',
                data: [
                    {
                        id: 'date-slot-1',
                        date: '2025-11-21',
                        times: [
                            { id: 'time-1', startTime: '09:00', endTime: '09:30', isBooked: false, available: true },
                            { id: 'time-2', startTime: '10:00', endTime: '10:30', isBooked: false, available: true },
                        ],
                        regionId: 'region-1',
                    },
                ],
            },
        },
    })
    @Post()
    async createSlots(@Body() dto: AvailableSlotsForMeetingDto[], @Req() req) {
        // note: your service probably accepts either single or multiple; adjust call accordingly
        const results = await Promise.all(dto.map(item => this.service.createAvailability(item, req.user)));
        return results;
    }

    // Get SLOT (filtered)
    @ApiOperation({ summary: 'Get slots for a region between dates' })
    @ApiQuery({ name: 'regionId', required: true })
    @ApiQuery({ name: 'startDate', required: true })
    @ApiQuery({ name: 'endDate', required: true })
    @ApiQuery({ name: 'filter', required: false, description: 'all | booked | unbooked' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Slots fetched',
                data: {
                    items: [
                        {
                            id: 'date-slot-1',
                            date: '2025-11-21',
                            times: [
                                { id: 'time-1', startTime: '09:00', endTime: '09:30', isBooked: false, available: true },
                                { id: 'time-2', startTime: '10:00', endTime: '10:30', isBooked: true, available: false },
                            ],
                            regionId: 'region-1',
                        },
                    ],
                    total: 1,
                    page: 1,
                    limit: 10,
                },
            },
        },
    })
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

        return this.service.getAllSlots(regionId, startDate, endDate, filter, parseInt(page, 10), parseInt(limit, 10));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get slot by ID' })
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Slot fetched',
                data: {
                    id: 'date-slot-1',
                    date: '2025-11-21',
                    times: [
                        { id: 'time-1', startTime: '09:00', endTime: '09:30', isBooked: false, available: true },
                    ],
                },
            },
        },
    })
    async getSlotById(@Param('id') id: string) {
        return this.service.getSlotById(id);
    }

    // Update slot (time)
    @UseGuards(JwtAuthGuard)
    @Roles('ZONE_MANAGER', 'ADMIN', 'DOULA')
    @ApiOperation({ summary: 'Update a timeslot (start/end) or its metadata' })
    @ApiBody({ type: UpdateSlotsForMeetingTimeDto })
    @ApiResponse({ status: 200, type: SwaggerResponseDto, schema: { example: { success: true, message: 'Slot updated', data: { timeSlotId: 'time-1' } } } })
    @Patch()
    async updateSlot(@Body() dto: UpdateSlotsForMeetingTimeDto, @Req() req) {
        return this.service.updateSlotTimeById(dto, req.user.id);
    }

    // DELETE slot
    @UseGuards(JwtAuthGuard)
    @Roles('ZONE_MANAGER', 'ADMIN', 'DOULA')
    @ApiOperation({ summary: 'Delete a date-slot (and its time entries)' })
    @ApiParam({ name: 'slotId', description: 'Date slot id' })
    @ApiResponse({ status: 200, type: SwaggerResponseDto, schema: { example: { success: true, message: 'Slot deleted', data: null } } })
    @Delete(':slotId')
    async deleteSlot(@Param('slotId') slotId: string, @Req() req) {
        return this.service.deleteSlots(slotId, req.user.id);
    }

    @Patch('mark/availability/:id')
    @ApiOperation({ summary: 'Mark a time entry availability/booked' })
    @ApiParam({ name: 'id', description: 'Time slot entry id' })
    @ApiBody({ schema: { example: { booked: true, availabe: false } } })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: { example: { success: true, message: 'Time availability updated', data: { id: 'time-1', booked: true, availabe: false } } },
    })
    async updateSlotAvail(@Param('id') id: string, @Body('booked') booked: boolean, @Body('availabe') availabe: boolean) {
        return this.service.updateTimeSlotAvailability(id, booked, availabe);
    }
}
