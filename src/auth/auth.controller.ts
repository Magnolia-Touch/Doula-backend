import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
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

    // Register Admin - protected
    @ApiOperation({ summary: 'Send registration OTP (admin)' })
    @ApiBody({ type: RegistrationDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'OTP sent to admin email',
                data: null,
            },
        },
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('bearer')
    @Post('register/admin')
    async RegistrationAdmin(@Body() dto: RegistrationDto) {
        return this.authService.RegisterAdmin(dto);
    }

    // Send login OTP
    @ApiOperation({ summary: 'Send login OTP' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'OTP sent to the provided email',
                data: null,
            },
        },
    })
    @Post('send/otp')
    async LoginOtp(@Body() dto: LoginDto) {
        return this.authService.LoginOtp(dto);
    }

    // Verify OTP and login/register
    @ApiOperation({ summary: 'Verify OTP and login/register' })
    @ApiBody({ type: OtpVerifyDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'OTP verified. User logged in/registered',
                data: {
                    token: 'jwt-token',
                    user: {
                        id: 'user-uuid',
                        email: 'user@example.com',
                        role: 'CLIENT'
                    }
                }
            }
        }
    })
    @Post('verify/otp')
    async verifyOtp(@Body() dto: OtpVerifyDto) {
        return this.authService.verifyOtp(dto);
    }

    // Authenticated user's own profile
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async myProfile(@Req() req: any) {
        const userId = req.user.id; // from JWT token
        return this.authService.Profile(userId);
    }

    // // Fetch profile of any user by ID (admin or internal use)
    // @UseGuards(JwtAuthGuard)
    // @Get('profile/:userId')
    // async getProfile(@Param('userId') userId: string) {
    //     const result = await this.authService.Profile(userId);
    //     return { success: true, data: result };
    // }
}
