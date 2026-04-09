import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Delete,
  Patch,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UserRegistrationDto } from './dto/user-registration.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';

@ApiTags('User Management')
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private readonly service: UserService) { }

  @Post('register/user')
  @ApiOperation({
    summary: 'Send user registration OTP',
    description:
      'Sends an OTP to the user email for registration verification. This initiates the user registration process.',
  })
  @ApiBody({
    type: UserRegistrationDto,
    description: 'User registration details with email',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully to email',
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'OTP sent to user email',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid registration payload or email already registered',
    schema: {
      example: {
        statusCode: 400,
        message: 'Email is already registered',
        error: 'Bad Request',
      },
    },
  })
  async RegisterUser(@Body() dto: UserRegistrationDto) {
    return this.service.RegisterUser(dto);
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Delete all users',
    description: 'Delete all users from the system. Use with caution - this action is permanent.',
  })
  @ApiResponse({
    status: 200,
    description: 'All users deleted successfully',
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'All users deleted successfully',
        data: {
          deletedCount: 15,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async deleteAll() {
    return this.service.deleteAll();
  }

  @Patch('change/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Change user account status',
    description:
      'Allows admin to activate or deactivate a user account. Only admins have access to this endpoint.',
  })
  @ApiBody({
    type: ChangeUserStatusDto,
    description: 'User ID and new status (active/inactive)',
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'User status updated successfully',
        data: {
          userId: 'user-uuid-123',
          is_active: false,
          updatedAt: '2026-04-09T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – only admins can change user status',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async changeUserStatus(@Body() dto: ChangeUserStatusDto, @Req() req) {
    return this.service.changeUserStatus(dto, req.user.role);
  }
}
