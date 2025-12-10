import {
    Controller, Post, Body, Get, Param, Delete
} from '@nestjs/common';
import { DeviceTokenService } from './device-token.service';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Device Tokens')
@Controller({
    path: 'device-tokens',
    version: '1',
})
export class DeviceTokenController {
    constructor(private readonly service: DeviceTokenService) { }

    @Post()
    @ApiOperation({ summary: 'Register a new device token' })
    @ApiBody({ type: CreateDeviceTokenDto })
    @ApiResponse({ status: 201, description: 'Device token registered' })
    register(@Body() dto: CreateDeviceTokenDto) {
        return this.service.register(dto);
    }

    @Get(':userId')
    @ApiOperation({ summary: 'Get all device tokens for a user' })
    @ApiParam({ name: 'userId', type: String })
    @ApiResponse({ status: 200, description: 'List of device tokens' })
    listForUser(@Param('userId') userId: string) {
        return this.service.findByUser(userId);
    }

    @Delete(':token')
    @ApiOperation({ summary: 'Delete a device token' })
    @ApiParam({ name: 'token', type: String })
    @ApiResponse({ status: 200, description: 'Device token deleted' })
    remove(@Param('token') token: string) {
        return this.service.delete(token);
    }
}
