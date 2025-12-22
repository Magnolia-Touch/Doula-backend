import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Delete,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('User')
@Controller({
    path: 'user',
    version: '1',
})
export class UserController {
    constructor(private readonly service: UserService) { }

    // Register Admin - protected
    @ApiOperation({ summary: 'Send registration OTP' })
    @ApiBody({ type: UserRegistrationDto })
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
    @ApiBearerAuth('bearer')
    @Post('register/user')
    async RegisterUser(@Body() dto: UserRegistrationDto) {
        return this.service.RegisterUser(dto);
    }

    @Delete('delete')
    async deleteAll() {
        return this.service.deleteAll();
    }


}
