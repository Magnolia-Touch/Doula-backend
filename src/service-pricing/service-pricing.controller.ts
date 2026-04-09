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
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';

@ApiTags('Service Pricing')
@ApiBearerAuth('bearer')
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
  @ApiOperation({
    summary: 'Create a service pricing entry',
    description:
      'Create a new service pricing for the logged-in doula. Only doulas can create pricing for their services.',
  })
  @ApiBody({ type: CreateServicePricingDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    description: 'Service pricing created successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Service pricing created successfully',
        data: {
          id: 'pricing-uuid-123',
          serviceId: 'service-uuid-456',
          doulaId: 'doula-uuid-789',
          price: 4999,
          createdAt: '2026-04-09T10:12:00.123Z',
          updatedAt: '2026-04-09T10:12:00.123Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid pricing data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - must be a doula',
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
    description: 'Retrieve all pricing entries for the authenticated doula.',
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Service pricing list retrieved successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Service pricing list',
        data: [
          {
            id: 'pricing-uuid-1',
            serviceId: 'service-uuid-456',
            doulaId: 'doula-uuid-789',
            price: 4999,
            service: {
              id: 'service-uuid-456',
              name: 'Birth Doula',
              description: 'Professional birth doula support',
            },
            createdAt: '2026-04-09T10:12:00.123Z',
            updatedAt: '2026-04-09T10:12:00.123Z',
          },
          {
            id: 'pricing-uuid-2',
            serviceId: 'service-uuid-457',
            doulaId: 'doula-uuid-789',
            price: 3999,
            service: {
              id: 'service-uuid-457',
              name: 'Postpartum Care',
              description: 'Postpartum support and care',
            },
            createdAt: '2026-04-08T15:20:00.123Z',
            updatedAt: '2026-04-08T15:20:00.123Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findAll(@Req() req) {
    const user = req.user.id;
    return this.servicesService.findAll(user);
  }

  // --------------------------------------------------------
  // FIND ONE
  // --------------------------------------------------------
  @Get(':id')
  @ApiOperation({
    summary: 'Get service pricing by ID',
    description: 'Retrieve pricing details for a specific service pricing entry.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Service pricing ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Service pricing retrieved successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Service pricing fetched',
        data: {
          id: 'pricing-uuid-123',
          serviceId: 'service-uuid-456',
          doulaId: 'doula-uuid-789',
          price: 4999,
          service: {
            id: 'service-uuid-456',
            name: 'Birth Doula',
            description: 'Professional birth doula support',
          },
          createdAt: '2026-04-09T10:12:00.123Z',
          updatedAt: '2026-04-09T10:12:00.123Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Service pricing not found',
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
  @ApiOperation({
    summary: 'Update service pricing',
    description: 'Update the price of an existing service pricing entry.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Service pricing ID (UUID)',
  })
  @ApiBody({ type: UpdateServicePricingDto })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Service pricing updated successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Service pricing updated successfully',
        data: {
          id: 'pricing-uuid-123',
          serviceId: 'service-uuid-456',
          doulaId: 'doula-uuid-789',
          price: 5999,
          updatedAt: '2026-04-09T11:00:00.123Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Service pricing not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - can only update own pricing',
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
  @ApiOperation({
    summary: 'Delete service pricing',
    description: 'Delete a service pricing entry. Only the doula who created it can delete.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Service pricing ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Service pricing deleted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Service pricing deleted successfully',
        data: {
          id: 'pricing-uuid-123',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Service pricing not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  // --------------------------------------------------------
  // LIST SERVICES + PRICING with QUERY
  // --------------------------------------------------------
  @Get('all/list')
  @ApiOperation({
    summary: 'Get services and pricing by service name and doula ID',
    description:
      'Retrieve all pricing entries for a specific service, optionally filtered by doula.',
  })
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
    description: 'Service name (e.g., "Birth Doula")',
    example: 'Birth Doula',
  })
  @ApiQuery({
    name: 'doulaId',
    required: false,
    type: String,
    description: 'Filter by specific doula ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Service pricing list retrieved successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Service pricing fetched',
        data: {
          serviceName: 'Birth Doula',
          pricings: [
            {
              id: 'pricing-uuid-1',
              doulaId: 'doula-uuid-1',
              doulaName: 'Anita Sharma',
              price: 4999,
              serviceId: 'service-uuid-456',
            },
            {
              id: 'pricing-uuid-2',
              doulaId: 'doula-uuid-2',
              doulaName: 'Sarah Johnson',
              price: 5999,
              serviceId: 'service-uuid-456',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  getServiceWithPricing(@Query() query) {
    return this.servicesService.listServices(query);
  }
}
