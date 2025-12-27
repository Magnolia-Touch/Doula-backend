import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ServicePricingService } from './service-pricing.service';
import {
  CreateServicePricingDto,
  UpdateServicePricingDto,
} from './dto/service-pricing.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Service Pricing')
@ApiBearerAuth()
@Controller({
  path: 'services-pricing',
  version: '1',
})
export class ServicePricingController {
  constructor(private readonly servicesService: ServicePricingService) { }

  // --------------------------------------------------------
  // CREATE
  // --------------------------------------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Post()
  @ApiOperation({ summary: 'Create a service pricing entry' })
  @ApiResponse({
    status: 201,
    description: 'Service pricing created successfully',
    schema: {
      example: {
        message: 'Created successfully',
        data: {
          id: 'uuid',
          serviceId: 'uuid',
          price: 4999,
          createdAt: '2025-01-12T10:12:00.123Z',
        },
      },
    },
  })
  create(@Body() dto: CreateServicePricingDto, @Req() req) {
    const user = req.user.id;
    return this.servicesService.create(dto, user);
  }

  // --------------------------------------------------------
  // FIND ALL (DOULA)
  // --------------------------------------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get()
  @ApiOperation({
    summary: 'Get all service pricing entries for current doula',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Service pricing list',
        data: [
          {
            id: 'uuid',
            serviceId: 'uuid',
            price: 4999,
            doulaId: 'uuid',
          },
        ],
      },
    },
  })
  findAll(@Req() req) {
    const user = req.user.id;
    return this.servicesService.findAll(user);
  }

  // --------------------------------------------------------
  // FIND ONE
  // --------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get service pricing by ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 'uuid',
        serviceId: 'uuid',
        price: 4999,
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  // --------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Patch(':id')
  @ApiOperation({ summary: 'Update service pricing' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Updated successfully',
        updated: {
          id: 'uuid',
          serviceId: 'uuid',
          price: 5999,
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() dto: UpdateServicePricingDto) {
    return this.servicesService.update(id, dto);
  }

  // --------------------------------------------------------
  // DELETE
  // --------------------------------------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete service pricing' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Deleted successfully',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  // --------------------------------------------------------
  // LIST SERVICES + PRICING with QUERY
  // --------------------------------------------------------
  @ApiOperation({
    summary: 'Get services and pricing by service name and doula ID',
  })
  @ApiQuery({ name: 'name', required: true, example: 'Pregnancy Yoga' })
  @ApiQuery({ name: 'doulaId', required: false, example: 'uuid' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        serviceName: 'Pregnancy Yoga',
        pricings: [
          {
            doulaId: 'uuid',
            price: 4999,
            serviceId: 'uuid',
          },
        ],
      },
    },
  })
  @Get('all/list')
  getServiceWithPricing(@Query() query) {
    return this.servicesService.listServices(query);
  }

}
