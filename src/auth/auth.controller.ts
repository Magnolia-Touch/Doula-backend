import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('bearer')
  @Post('register/admin')
  async RegistrationAdmin(@Body() dto: RegistrationDto) {
    return this.authService.RegisterAdmin(dto);
  }

  // Send login OTP
  @ApiOperation({ summary: 'Send login OTP For All Users' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: "success",
        message: "Otp Sent Succesfully",
        data: "815007",
      },
    },
  })
  @Post('send/otp')
  async LoginOtp(@Body() dto: LoginDto) {
    return this.authService.LoginOtp(dto);
  }

  // Verify OTP and login/register
  @ApiOperation({ summary: 'Verify Authentication OTP' })
  @ApiBody({ type: OtpVerifyDto })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: "success",
        message: "User Verified Successfully",
        data: {
          "user": {
            "id": "a0f185ed-8c28-4316-ac07-dbdc7dce8f38",
            "name": "Anita Sharma",
            "email": "doula@test.com",
            "phone": "+919876543342",
            "otp": "563893",
            "otpExpiresAt": "2025-12-31T04:22:39.695Z",
            "role": "DOULA",
            "is_active": true,
            "createdAt": "2025-12-27T12:27:47.513Z",
            "updatedAt": "2025-12-31T04:12:39.696Z"
          },
          "accessToken": "user uuid",
          "message": "User Verified Successfully",
          "status": 200
        },
      },
    },
  })
  @Post('verify/otp/doula')
  async verifyOtp(@Body() dto: OtpVerifyDto) {
    return this.authService.verifyOtp(dto);
  }

  // Authenticated user's own profile
  @ApiOperation({ summary: 'Profile View API' })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "role": "DOULA",
          "user": {
            "userId": "a0f185ed-8c28-4316-ac07-dbdc7dce8f38",
            "email": "doula@test.com",
            "name": "Anita Sharma",
            "phone": "+919876543342",
            "is_active": true,
            "role": "DOULA"
          },
          "profile": {
            "profileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
            "description": "Certified birth doula with 6+ years of experience",
            "qualification": "Certified Birth Doula (CBD)",
            "achievements": "Supported 300+ successful births",
            "yoe": 6,
            "languages": [
              "English",
              "Hindi",
              "Tamil"
            ],
            "regions": [
              {
                "regionId": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
                "regionName": "Texas"
              }
            ],
            "doulaImages": [
              {
                "id": "003dd08a-fb13-4a2d-a004-76ffe49a5dfc",
                "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                "url": "uploads/doulas/1767154479162-382266985.png",
                "altText": null,
                "createdAt": "2025-12-31T04:14:39.180Z"
              },
              {
                "id": "97c0e4c8-54c5-4f72-8120-86803a4a9592",
                "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
                "url": "uploads/doulas/1767154479164-287555438.png",
                "altText": null,
                "createdAt": "2025-12-31T04:14:39.180Z"
              }
            ]
          }
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async myProfile(@Req() req: any) {
    const userId = req.user.id; // from JWT token
    return this.authService.Profile(userId);
  }

  @Post('verify/otp/admin')
  async verifyAdminOtp(@Body() dto: OtpVerifyDto) {
    return this.authService.verifyOtpAdmin(dto);
  }


  @Post('verify/otp/client')
  async verifyOtpClient(@Body() dto: OtpVerifyDto) {
    return this.authService.verifyOtpClient(dto);
  }

  @Post('verify/otp/zonemanager')
  async verifyOtpZoneManager(@Body() dto: OtpVerifyDto) {
    return this.authService.verifyOtpZoneManager(dto);
  }

}
