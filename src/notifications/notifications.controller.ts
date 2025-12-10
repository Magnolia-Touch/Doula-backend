import {
    Controller, Get, Post, Body, Param, Patch, Delete, Query
} from '@nestjs/common';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notifications.dto';
import { NotificationService } from './notifications.service';
import {
    ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody
} from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller({
    path: 'notifications',
    version: '1',
})
export class NotificationController {
    constructor(private readonly service: NotificationService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new notification' })
    @ApiBody({ type: CreateNotificationDto })
    @ApiResponse({ status: 201, description: 'Notification created' })
    create(@Body() dto: CreateNotificationDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all notifications' })
    @ApiQuery({ name: 'userId', required: false })
    @ApiResponse({ status: 200, description: 'List of notifications' })
    findAll(@Query('userId') userId?: string) {
        return this.service.findAll(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a notification by id' })
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({ status: 200, description: 'Notification fetched' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update notification by id' })
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ type: UpdateNotificationDto })
    update(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    @ApiParam({ name: 'id', type: String })
    markAsRead(@Param('id') id: string) {
        return this.service.markAsRead(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete notification' })
    @ApiParam({ name: 'id', type: String })
    softDelete(@Param('id') id: string) {
        return this.service.softDelete(id);
    }

    @Post('send-test/:userId')
    @ApiOperation({ summary: 'Send a test notification immediately' })
    @ApiParam({ name: 'userId', type: String })
    sendTest(@Param('userId') userId: string) {
        return this.service.sendNow(userId);
    }
}
