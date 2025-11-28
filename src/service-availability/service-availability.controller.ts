import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    Param,
    Query,
    Req,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DoulaServiceAvailabilityService } from './service-availability.service';
import { CreateDoulaServiceAvailability, UpdateDoulaServiceAvailabilityDTO } from './dto/service-availability.dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';

@ApiTags('Doula Service Availability')
@ApiBearerAuth('bearer')
@Controller({
    path: 'service/availability',
    version: '1',
})
export class DoulaServiceAvailabilityController {
    constructor(private readonly service: DoulaServiceAvailabilityService) { }

    // CREATE SLOTS
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOULA)
    @ApiOperation({ summary: 'Create doula service availability slots' })
    @ApiBody({ type: CreateDoulaServiceAvailability, isArray: true })
    @ApiResponse({
        status: 201,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Availability created',
                data: [
                    {
                        id: 'date-avail-1',
                        date: '2025-11-21',
                        times: [{ id: 't1', startTime: '09:00', endTime: '09:30', isBooked: false }],
                        doulaId: 'doula-1',
                    },
                ],
            },
        },
    })
    @Post()
    async createSlots(@Body() dto: CreateDoulaServiceAvailability[], @Req() req) {
        const results = await Promise.all(
            dto.map((item) => this.service.createAvailability(item, req.user))
        );
        return results;
    }

    // Get SLOT
    @ApiOperation({ summary: 'Get availability for a doula between dates' })
    @ApiQuery({ name: 'doulaId', required: true })
    @ApiQuery({ name: 'startDate', required: true })
    @ApiQuery({ name: 'endDate', required: true })
    @ApiQuery({ name: 'filter', required: false, description: 'all | booked | unbooked' })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Availability fetched',
                data: {
                    items: [
                        {
                            id: 'date-avail-1',
                            date: '2025-11-21',
                            times: [{ id: 't1', startTime: '09:00', endTime: '09:30', isBooked: false }],
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
        @Query('doulaId') doulaId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('filter') filter: 'all' | 'booked' | 'unbooked' = 'all',
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        if (!doulaId) throw new BadRequestException('doulaId is required');
        if (!startDate) throw new BadRequestException('startDate is required');
        if (!endDate) throw new BadRequestException('endDate is required');

        return this.service.getAllSlots(doulaId, startDate, endDate, filter, parseInt(page, 10), parseInt(limit, 10));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get availability by date id' })
    @ApiParam({ name: 'id', description: 'Date availability id' })
    @ApiResponse({ status: 200, type: SwaggerResponseDto, schema: { example: { success: true, message: 'Availability fetched', data: { id: 'date-avail-1', date: '2025-11-21', times: [{ id: 't1', startTime: '09:00' }] } } } })
    async getSlotById(@Param('id') id: string) {
        return this.service.getSlotById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOULA)
    @Patch(':id')
    @ApiOperation({ summary: 'Update a specific availability time' })
    @ApiBody({ type: UpdateDoulaServiceAvailabilityDTO })
    @ApiResponse({ status: 200, type: SwaggerResponseDto, schema: { example: { success: true, message: 'Availability updated', data: { id: 'date-avail-1', timeId: 't1' } } } })
    async updateSlot(@Body() dto: UpdateDoulaServiceAvailabilityDTO, @Param('id') id: string, @Req() req) {
        return this.service.updateSlotTimeById(dto, id, req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOULA)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete availability (by id) for the doula' })
    @ApiResponse({ status: 200, type: SwaggerResponseDto, schema: { example: { success: true, message: 'Availability deleted', data: null } } })
    async deleteSlot(@Param('id') id: string, @Req() req) {
        return this.service.deleteSlots(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOULA)
    @Patch('/date/:id')
    @ApiOperation({ summary: 'Update all time entries for a date availability (helper)' })
    @ApiResponse({ status: 200, type: SwaggerResponseDto, schema: { example: { success: true, message: 'Availability times updated', data: null } } })
    async updateSlotTimeByDate(@Param('id') id: string) {
        return this.service.updateSlotTimeByDate(id);
    }
}
