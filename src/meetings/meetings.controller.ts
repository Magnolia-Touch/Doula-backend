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
import { ScheduleDoulaDto } from './dto/schedule-doula.dto';
import { cancelDto } from './dto/cancel.dto';
import { RescheduleDto } from './dto/reschedule.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';

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
    @ApiQuery({ name: 'status', required: false, description: 'SCHEDULED | COMPLETED | CANCELED' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Meetings fetched successfully',
                data: {
                    items: [
                        {
                            id: 'meeting-uuid-1',
                            status: 'SCHEDULED',
                            createdAt: '2025-11-20T10:00:00.000Z',
                            slot: {
                                id: 'slot-uuid-1',
                                date: '2025-11-25',
                                startTime: '09:00',
                                endTime: '09:30',
                                region: { id: 'region-1', regionName: 'South City' },
                            },
                            service: { id: 'service-1', name: 'Postnatal Visit' },
                            doula: { id: 'doula-1', name: 'Jane Doe', phone: '+919876543210' },
                            bookedBy: { id: 'client-1', name: 'Asha Patel', email: 'asha@example.com' },
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
    async getMeetings(
        @Query() params: { startDate?: string; endDate?: string; status?: string; page?: number; limit?: number },
        @Req() req,
    ) {
        return this.service.getMeetings(params, req.user);
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
                success: true,
                message: 'Meeting fetched',
                data: {
                    id: 'meeting-uuid-1',
                    status: 'SCHEDULED',
                    slot: {
                        id: 'slot-uuid-1',
                        date: '2025-11-25',
                        startTime: '09:00',
                        endTime: '09:30',
                    },
                    service: { id: 'serv-1', name: 'Prenatal Visit' },
                    doula: { id: 'doula-1', name: 'Jane Doe' },
                    bookedBy: { id: 'client-1', name: 'Asha Patel', phone: '+919876543210' },
                    remarks: 'Client prefers video call',
                },
            },
        },
    })
    @Get(':id')
    async getMeetingById(@Param('id') id: string, @Req() req) {
        return this.service.getMeetingById(id, req.user);
    }

    // SCHEDULE MEETING (DOULA)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ZONE_MANAGER)
    @ApiOperation({ summary: 'Schedule a meeting with a doula' })
    @ApiBody({ type: ScheduleDoulaDto })
    @ApiResponse({
        status: 201,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Meeting scheduled',
                data: {
                    id: 'meeting-uuid-new',
                    status: 'SCHEDULED',
                    slot: { id: 'slot-uuid', date: '2025-11-30', startTime: '10:00', endTime: '10:30' },
                    doula: { id: 'doula-5', name: 'Priya Singh' },
                    bookedBy: { id: 'client-12', name: 'Ragini' },
                },
            },
        },
    })
    @Post('doula/schedule')
    async scheduleDoulaMeeting(@Body() dto: ScheduleDoulaDto, @Req() req) {
        return this.service.doulasMeetingSchedule(dto, req.user);
    }

    // CANCEL MEETING
    @ApiOperation({ summary: 'Cancel a meeting' })
    @ApiBody({ type: cancelDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: { example: { success: true, message: 'Meeting cancelled', data: { meetingId: 'meeting-uuid-1', status: 'CANCELED' } } },
    })
    @Post('cancel')
    async cancelMeeting(@Body() dto: cancelDto, @Req() req) {
        return this.service.cancelMeeting(dto, req.user);
    }

    // RESCHEDULE MEETING
    @ApiOperation({ summary: 'Reschedule a meeting to a new slot' })
    @ApiBody({ type: RescheduleDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Meeting rescheduled',
                data: {
                    meetingId: 'meeting-uuid-1',
                    oldSlotId: 'slot-old',
                    newSlot: { id: 'slot-new', date: '2025-12-05', startTime: '11:00', endTime: '11:30' },
                    status: 'SCHEDULED',
                },
            },
        },
    })
    @Post('reschedule')
    async rescheduleMeeting(@Body() dto: RescheduleDto, @Req() req) {
        return this.service.rescheduleMeeting(dto, req.user);
    }

    // UPDATE MEETING STATUS
    @ApiOperation({ summary: 'Update meeting status (ADMIN/DOULA)' })
    @ApiBody({ type: UpdateStatusDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: { example: { success: true, message: 'Meeting status updated', data: { meetingId: 'meeting-uuid-1', status: 'COMPLETED' } } },
    })
    @Patch('status')
    async updateMeetingStatus(@Body() dto: UpdateStatusDto, @Req() req) {
        return this.service.updateMeetingStatus(dto, req.user);
    }

    // DELETE ALL MEETINGS (ONLY ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete all meetings (Admin only)' })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: { example: { success: true, message: 'All meetings deleted', data: null } },
    })
    @Delete('delete-all')
    async deleteAllMeetings(@Req() req) {
        return this.service.deleteAllMeetings(req.user);
    }

    @Get("all/meetings")
    async getAllMeetings() {
        return this.service.findAllmeetings();
    }

    @Get('booked/slots')
    @ApiQuery({ name: 'date', required: true, example: '2025-02-12' })
    @ApiQuery({ name: 'doulaProfileId', required: false })
    @ApiQuery({ name: 'zoneManagerProfileId', required: false })
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
}
