import { Controller, Post, Body, UseGuards, Req, Delete, Patch } from '@nestjs/common';
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

@ApiTags('User')
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private readonly service: UserService) { }

  // Register Admin - protected
  @Post('register/user')
  @ApiOperation({
    summary: 'Send registration OTP',
    description:
      'Sends an OTP to the user email for registration verification',
  })
  @ApiBody({
    type: UserRegistrationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'OTP sent to admin email',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid registration payload',
  })
  @ApiBearerAuth('bearer')
  async RegisterUser(@Body() dto: UserRegistrationDto) {
    return this.service.RegisterUser(dto);
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Delete all users',
    description:
      'Deletes all users from the system (intended for internal or maintenance use)',
  })
  @ApiResponse({
    status: 200,
    description: 'All users deleted successfully',
    type: SwaggerResponseDto,
  })
  async deleteAll() {
    return this.service.deleteAll();
  }

  @Patch('change/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Change user status',
    description:
      'Allows admin to activate or deactivate a user account',
  })
  @ApiBody({
    type: ChangeUserStatusDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: SwaggerResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – only admins can change user status',
  })
  @ApiBearerAuth('bearer')
  async changeUserStatus(
    @Body() dto: ChangeUserStatusDto,
    @Req() req,
  ) {
    return this.service.changeUserStatus(
      dto,
      req.user.role,
    );
  }

}


