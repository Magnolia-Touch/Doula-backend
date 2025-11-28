import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    Query,
    Param,
    Delete,
    Patch,
} from '@nestjs/common';
import { DoulaService } from './doula.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
import { UpdateDoulaRegionDto } from './dto/update-doula.dto';
import { UpdateDoulaStatusDto } from './dto/update-doula-status.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';

@ApiTags('Doula')
@ApiBearerAuth('bearer')
@Controller({
    path: 'doula',
    version: '1',
})
export class DoulaController {
    constructor(private readonly service: DoulaService) { }

    // CREATE
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ZONE_MANAGER')
    @Post()
    @ApiOperation({ summary: 'Create a new Doula' })
    @ApiBody({ type: CreateDoulaDto })
    @ApiResponse({
        status: 201,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doula created successfully',
                data: {
                    id: 'doula-uuid',
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    phone: '+919876543210',
                    regionIds: ['region-uuid-1', 'region-uuid-2']
                }
            }
        }
    })
    async create(@Body() dto: CreateDoulaDto, @Req() req) {
        return this.service.create(dto, req.user.id);
    }

    // GET LIST
    @Get()
    @ApiOperation({ summary: 'Get all Doulas with pagination & search' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doulas fetched',
                data: {
                    items: [
                        { id: 'doula-1', name: 'Jane', email: 'jane@example.com' },
                        { id: 'doula-2', name: 'Asha', email: 'asha@example.com' }
                    ],
                    total: 2,
                    page: 1,
                    limit: 10
                }
            }
        }
    })
    async get(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search?: string,
    ) {
        return this.service.get(Number(page), Number(limit), search);
    }

    // GET BY ID
    @Get(':id')
    @ApiOperation({ summary: 'Get a Doula by ID' })
    @ApiParam({ name: 'id', required: true, description: 'Doula UUID' })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doula fetched',
                data: {
                    id: 'doula-uuid',
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    phone: '+919876543210',
                    regions: [{ id: 'region-1', name: 'Region A' }]
                }
            }
        }
    })
    async getById(@Param('id') id: string) {
        return this.service.getById(id);
    }

    // DELETE
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ZONE_MANAGER')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a Doula' })
    @ApiParam({ name: 'id', required: true, description: 'Doula UUID' })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: { success: true, message: 'Doula deleted', data: null }
        }
    })
    async delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    // UPDATE STATUS
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ZONE_MANAGER')
    @Patch(':id/update/status/')
    @ApiOperation({ summary: 'Update Doula status' })
    @ApiParam({ name: 'id', description: 'Doula ID' })
    @ApiBody({ type: UpdateDoulaStatusDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: { success: true, message: 'Status updated', data: { id: 'doula-uuid', isActive: true } }
        }
    })
    async updateStatus(@Param('id') id: string, @Body() body: UpdateDoulaStatusDto) {
        return this.service.updateStatus(id, body.isActive);
    }

    // UPDATE DOULA REGIONS
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ZONE_MANAGER')
    @Patch('update/regions')
    @ApiOperation({ summary: 'Add or remove regions from a Doula' })
    @ApiBody({ type: UpdateDoulaRegionDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doula regions updated',
                data: { profileId: 'profile-uuid', regionIds: ['r1', 'r2'], purpose: 'add' }
            }
        }
    })
    async updateRegions(@Body() dto: UpdateDoulaRegionDto, @Req() req) {
        return this.service.UpdateDoulaRegions(dto, req.user.id);
    }
}
