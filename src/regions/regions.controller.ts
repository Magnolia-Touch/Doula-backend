import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RegionService } from './regions.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/regions.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';

@ApiTags('Regions')
@ApiBearerAuth('bearer')
@Controller({
  path: 'regions',
  version: '1',
})
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a region' })
  @ApiBody({ type: CreateRegionDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Region created',
        data: {
          id: 'region-1',
          regionName: 'South City',
          pincode: '560001',
          district: 'Bengaluru',
          state: 'Karnataka',
          country: 'India',
        },
      },
    },
  })
  @Post()
  create(@Body() dto: CreateRegionDto) {
    return this.regionService.create(dto);
  }

  @ApiOperation({ summary: 'Get all regions (paginated & searchable)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Regions fetched',
        data: {
          items: [
            {
              id: 'region-1',
              regionName: 'South City',
              pincode: '560001',
              district: 'Bengaluru',
              state: 'Karnataka',
              country: 'India',
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
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.regionService.findAll(+page, +limit, search);
  }

  @ApiOperation({ summary: 'Get region by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Region fetched',
        data: { id: 'region-1', regionName: 'South City' },
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ZONE_MANAGER')
  @ApiOperation({ summary: 'Update region' })
  @ApiBody({ type: UpdateRegionDto })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Region updated',
        data: { id: 'region-1' },
      },
    },
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRegionDto) {
    return this.regionService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ZONE_MANAGER')
  @ApiOperation({ summary: 'Delete region' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: { success: true, message: 'Region deleted', data: null },
    },
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regionService.remove(id);
  }
}
