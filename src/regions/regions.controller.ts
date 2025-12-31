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
  constructor(private readonly regionService: RegionService) { }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a region' })
  @ApiBody({ type: CreateRegionDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "id": "ef23b992-c9e7-4525-9316-a85fc1079b1d",
          "regionName": "North Mumbai",
          "pincode": "4999035",
          "district": "Mumbai Suburban",
          "state": "Maharashtra",
          "country": "India",
          "latitude": "19.1136",
          "longitude": "72.8697",
          "is_active": true,
          "createdAt": "2025-11-25T13:18:08.441Z",
          "updatedAt": "2025-11-25T13:18:08.441Z",
          "zoneManagerId": null
        }
      }
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
        "status": "success",
        "message": "Regions fetched successfully",
        "data": [
          {
            "regionId": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
            "regionName": "Texas",
            "pincode": "000348",
            "district": "Texas",
            "state": "Texas",
            "country": "India",
            "latitude": "19.1136",
            "longitude": "72.8697",
            "is_active": true,
            "zoneManagerId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50"
          }
        ],
        "meta": {
          "total": 1,
          "page": 1,
          "limit": 10,
          "totalPages": 1,
          "hasNextPage": false,
          "hasPrevPage": false
        }
      }
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
        "status": "success",
        "message": "Request successful",
        "data": {
          "regionId": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
          "regionName": "Texas",
          "pincode": "000348",
          "district": "Texas",
          "state": "Texas",
          "country": "India",
          "latitude": "19.1136",
          "longitude": "72.8697",
          "zoneManagerId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
          "zonemanagerName": "Adam Smith",
          "zonemanagerPhone": "+918843488338",
          "zonemanagerEmail": "zonemanager@test.com"
        }
      }
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
        "status": "success",
        "message": "Request successful",
        "data": {
          "id": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
          "regionName": "North Mumbai",
          "pincode": "4999022",
          "district": "Mumbai Suburban",
          "state": "Maharashtra",
          "country": "India",
          "latitude": "19.1136",
          "longitude": "72.8697",
          "is_active": true,
          "createdAt": "2025-12-27T12:26:28.299Z",
          "updatedAt": "2025-12-31T04:52:13.135Z",
          "zoneManagerId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50"
        }
      }
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
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "id": "9e77d960-e508-4918-8a6f-6712cabedf91",
          "regionName": "Texas",
          "pincode": "000348",
          "district": "Texas",
          "state": "Texas",
          "country": "India",
          "latitude": "19.1136",
          "longitude": "72.8697",
          "is_active": true,
          "createdAt": "2025-12-31T04:52:39.589Z",
          "updatedAt": "2025-12-31T04:52:39.589Z",
          "zoneManagerId": null
        }
      },
    },
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regionService.remove(id);
  }
}
