import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DoulaServiceAvailabilityService } from './service-availability.service';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import {
  AvailableDoulasFilterDto,
  CreateDoulaServiceAvailabilityDto,
  UpdateDoulaServiceAvailabilityDto,
} from './dto/service-availability.dto';
import {
  CreateDoulaOffDaysDto,
  UpdateDoulaOffDaysDto,
} from './dto/off-days.dto';

@ApiTags('Doula Service Availability')
@ApiBearerAuth('bearer')
@Controller({
  path: 'service/availability',
  version: '1',
})
export class DoulaServiceAvailabilityController {
  constructor(private readonly service: DoulaServiceAvailabilityService) {}

  // CREATE SLOTS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Post()
  @ApiOperation({
    summary: 'Create doula service availability',
    description:
      'Creates availability slots for the logged-in doula for a given date range and shift configuration',
  })
  @ApiBody({ type: CreateDoulaServiceAvailabilityDto })
  @ApiResponse({
    status: 201,
    description: 'Availability created successfully',
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Service availability saved successfully',
        data: {
          from: '2027-03-22T00:00:00.000Z',
          to: '2027-03-31T00:00:00.000Z',
          totalDays: 10,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAvailability(
    @Body() dto: CreateDoulaServiceAvailabilityDto,
    @Req() req,
  ) {
    return this.service.createAvailability(dto, req.user);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get()
  @ApiOperation({
    summary: 'Get all service availability slots of logged-in doula',
  })
  @ApiQuery({
    name: 'date1',
    required: false,
    description: 'Start date filter',
  })
  @ApiQuery({ name: 'date2', required: false, description: 'End date filter' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Availability list fetched successfully',
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Service availability fetched successfully',
        data: [
          {
            id: '03b79e55-499a-4a9c-bf95-525b88e3f021',
            date: '2027-03-22T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
          {
            id: '114e38d0-5878-40a2-aab0-396029b87dd9',
            date: '2027-03-23T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
          {
            id: 'ad0f9055-f63e-4f13-bcb0-3af2b69e7af8',
            date: '2027-03-24T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
          {
            id: 'cb960d95-5b66-46c0-9ae2-6c7f65073e30',
            date: '2027-03-25T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
          {
            id: '23639b3c-7440-4d4a-bccc-4cb4a9e0e24f',
            date: '2027-03-26T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
          {
            id: 'e9977f6a-7aa7-4c17-96d7-d005fd80df37',
            date: '2027-03-27T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
          {
            id: '77a5eeaf-a9c5-48df-8870-969dc6ca8617',
            date: '2027-03-28T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
          {
            id: '542faa6e-a4e2-4f3c-87c5-f7fcaef55323',
            date: '2027-03-29T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
          {
            id: 'a79e378a-cc61-4a32-a2b4-d648c17456fd',
            date: '2027-03-30T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
          {
            id: '17c30365-6381-47a9-95ca-7f20d5e7df95',
            date: '2027-03-31T00:00:00.000Z',
            availability: {
              NIGHT: true,
              FULLDAY: true,
              MORNING: true,
            },
            createdAt: '2026-01-10T11:33:34.865Z',
            updatedAt: '2026-01-10T11:33:34.865Z',
            doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
          },
        ],
        meta: {
          total: 10,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    },
  })
  async findAll(
    @Req() req,
    @Query('date1') date1?: string,
    @Query('date2') date2?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(req.user, {
      date1,
      date2,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get(':id')
  @ApiOperation({
    summary: 'Get service availability by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Service availability ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability fetched successfully',
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Service availability fetched successfully',
        data: {
          id: '03b79e55-499a-4a9c-bf95-525b88e3f021',
          date: '2027-03-22T00:00:00.000Z',
          availability: {
            NIGHT: true,
            FULLDAY: true,
            MORNING: true,
          },
          createdAt: '2026-01-10T11:33:34.865Z',
          updatedAt: '2026-01-10T11:33:34.865Z',
          doulaId: 'c47f4da8-c249-403f-9e27-f0452dec9a41',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async findOne(@Param('id') id: string, @Req() req) {
    return this.service.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update service availability',
  })
  @ApiParam({
    name: 'id',
    description: 'Service availability ID',
  })
  @ApiBody({ type: UpdateDoulaServiceAvailabilityDto })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Service availability updated successfully',
        data: {
          id: '9397ef7b-93c6-4d43-86aa-86b0c86138c0',
          date: '2025-10-10T00:00:00.000Z',
          availability: {
            NIGHT: true,
            FULLDAY: false,
            MORNING: false,
          },
          createdAt: '2025-12-27T12:28:19.698Z',
          updatedAt: '2025-12-27T12:30:58.409Z',
          doulaId: '655fa3dd-7b27-4371-b9e8-9bf4343b7735',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: UpdateDoulaServiceAvailabilityDto,
  ) {
    return this.service.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete service availability',
  })
  @ApiParam({
    name: 'id',
    description: 'Service availability ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability deleted successfully',
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Service availability deleted successfully',
        data: {
          message: 'Service availability deleted successfully',
        },
      },
    },
  })
  async remove(@Param('id') id: string, @Req() req) {
    return this.service.remove(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Post('doula/off-days')
  @ApiOperation({
    summary: 'Create off-days for doula',
    description:
      'Marks one or more days as unavailable for the logged-in doula',
  })
  @ApiBody({ type: CreateDoulaOffDaysDto })
  @ApiResponse({
    status: 201,
    description: 'Off-days created successfully',
    type: SwaggerResponseDto,
    schema: {
      example: {
        status: 'success',
        message: 'Service availability updated successfully',
        data: {
          from: '2027-01-13T00:00:00.000Z',
          to: '2027-01-13T00:00:00.000Z',
          offtime: {
            MORNING: true,
            NIGHT: true,
            FULLDAY: true,
          },
          totalCreated: 1,
        },
      },
    },
  })
  async createOffDays(@Body() dto: CreateDoulaOffDaysDto, @Req() req) {
    return this.service.createOffDays(dto, req.user);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.DOULA)
  // @Get('doula/off-days')
  // @ApiOperation({
  //   summary: 'Get all off-days of logged-in doula',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Off-days fetched successfully',
  //   type: SwaggerResponseDto,
  //   schema: {
  //     example: {
  //       "status": "success",
  //       "message": "Off days fetched successfully",
  //       "data": [
  //         {
  //           "id": "ba5fcba0-328f-4ca4-949d-d2344cd6c651",
  //           "date": "2027-01-01T00:00:00.000Z",
  //           "offtime": {
  //             "NIGHT": true,
  //             "FULLDAY": true,
  //             "MORNING": true
  //           },
  //           "createdAt": "2026-01-07T06:03:36.711Z",
  //           "updatedAt": "2026-01-07T06:03:36.711Z",
  //           "doulaProfileId": "c47f4da8-c249-403f-9e27-f0452dec9a41"
  //         },
  //         {
  //           "id": "73edfbb6-ed8f-40d7-95c8-2f248afb53fc",
  //           "date": "2027-01-11T00:00:00.000Z",
  //           "offtime": {
  //             "NIGHT": true,
  //             "FULLDAY": true,
  //             "MORNING": true
  //           },
  //           "createdAt": "2026-01-07T11:58:54.592Z",
  //           "updatedAt": "2026-01-07T11:58:54.592Z",
  //           "doulaProfileId": "c47f4da8-c249-403f-9e27-f0452dec9a41"
  //         }
  //       ]
  //     }
  //   }
  // })
  // async getOffDays(
  //   @Req() req,
  // ) {
  //   console.log(11)
  //   return this.service.getOffDays(req.user);
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.DOULA)
  // @Get('doula/off-days/:id')
  // @ApiOperation({
  //   summary: 'Get off-day by ID',
  // })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Off-day ID',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Off-day fetched successfully',
  //   type: SwaggerResponseDto,
  //   schema: {
  //     example: {
  //       "status": "success",
  //       "message": "Off day fetched successfully",
  //       "data": {
  //         "id": "ba5fcba0-328f-4ca4-949d-d2344cd6c651",
  //         "date": "2027-01-01T00:00:00.000Z",
  //         "offtime": {
  //           "NIGHT": true,
  //           "FULLDAY": true,
  //           "MORNING": true
  //         },
  //         "createdAt": "2026-01-07T06:03:36.711Z",
  //         "updatedAt": "2026-01-07T06:03:36.711Z",
  //         "doulaProfileId": "c47f4da8-c249-403f-9e27-f0452dec9a41"
  //       }
  //     }
  //   }
  // })

  // async getOffdaysbyId(
  //   @Param("id") id: string,
  //   @Req() req,
  // ) {
  //   return this.service.getOffdaysbyId(id, req.user);
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.DOULA)
  // @Patch('doula/off-days/:id')
  // async updateOffdays(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() dto: UpdateDoulaOffDaysDto,
  //   @Req() req,
  // ) {
  //   return this.service.updateOffdays(id, dto, req.user);
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.DOULA)
  // @Delete('doula/off-days/:id')
  // async removeOffdays(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Req() req,
  // ) {
  //   return this.service.removeOffdays(id, req.user);
  // }

  @Get('doula/available-doulas/list')
  @ApiOperation({
    summary: 'Get available doulas',
    description:
      'Returns list of available doulas based on date range, region, service, and shift filters',
  })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiQuery({ name: 'serviceId', required: false })
  @ApiQuery({ name: 'shift', required: false })
  @ApiResponse({
    status: 200,
    description: 'Available doulas fetched successfully',
    type: SwaggerResponseDto,
  })
  async getAvailableDoulas(@Query() filters: AvailableDoulasFilterDto) {
    return this.service.getAvailableDoulas(filters);
  }
}
