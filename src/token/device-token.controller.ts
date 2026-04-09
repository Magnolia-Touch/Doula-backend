import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DeviceTokenService } from './device-token.service';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Device Tokens')
@Controller({
  path: 'device-tokens',
  version: '1',
})
export class DeviceTokenController {
  constructor(private readonly service: DeviceTokenService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new device token',
    description:
      'Register a device token for push notifications. This is typically called when a user logs in on a new device.',
  })
  @ApiBody({ type: CreateDeviceTokenDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    description: 'Device token registered successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Device token registered successfully',
        data: {
          id: 'token-uuid-123',
          userId: 'user-uuid-456',
          token: 'firebase-device-token-string',
          deviceName: 'iPhone 14 Pro',
          platform: 'ios',
          createdAt: '2026-04-09T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid device token data',
  })
  register(@Body() dto: CreateDeviceTokenDto) {
    return this.service.register(dto);
  }

  @Get(':userId')
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all device tokens for a user',
    description:
      'Retrieve all registered device tokens for a specific user. Requires authentication.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Device tokens retrieved successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Device tokens retrieved successfully',
        data: [
          {
            id: 'token-uuid-123',
            userId: 'user-uuid-456',
            token: 'firebase-device-token-string-1',
            deviceName: 'iPhone 14 Pro',
            platform: 'ios',
            createdAt: '2026-04-09T10:30:00.000Z',
          },
          {
            id: 'token-uuid-124',
            userId: 'user-uuid-456',
            token: 'firebase-device-token-string-2',
            deviceName: 'Samsung Galaxy S22',
            platform: 'android',
            createdAt: '2026-04-08T15:20:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  listForUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Delete(':token')
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a device token',
    description:
      'Delete a registered device token. This is called when a user logs out on a device.',
  })
  @ApiParam({
    name: 'token',
    type: String,
    description: 'Device token to delete',
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Device token deleted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Device token deleted successfully',
        data: {
          token: 'firebase-device-token-string',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Device token not found',
  })
  remove(@Param('token') token: string) {
    return this.service.delete(token);
  }
}
