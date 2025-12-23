import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
@ApiTags('Services')
@ApiBearerAuth()
@Controller({
  path: 'services',
  version: '1',
})
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a service' })
  @ApiBody({
    type: CreateServiceDto,
    schema: {
      example: {
        name: 'Pregnancy Yoga',
        description: 'Breathing and relaxation techniques',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Service created',
    schema: {
      example: {
        message: 'Service created successfully',
        data: {
          id: 'uuid',
          name: 'Pregnancy Yoga',
          description: 'Breathing and relaxation techniques',
        },
      },
    },
  })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'Pregnancy Yoga',
          description: 'Helps with breathing',
        },
      ],
    },
  })
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 'uuid',
        name: 'Pregnancy Yoga',
        description: 'Helps with breathing',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update service' })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
  })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  @ApiResponse({
    status: 200,
    description: 'Service deleted',
    schema: {
      example: { message: 'Service deleted successfully' },
    },
  })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
