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
  })
  @ApiResponse({
    status: 201,
    description: 'Service created',
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          id: 'db2f9c1f-fb54-4a30-a365-7971d37ee6e5',
          name: 'Birth Doula',
          description:
            'A Birth Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.',
          createdAt: '2025-11-27T10:11:20.235Z',
          updatedAt: '2025-11-27T10:11:20.235Z',
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
      example: {
        status: 'success',
        message: 'Request successful',
        data: [
          {
            id: '26c11b42-417c-4e37-8543-4ef609646718',
            name: 'Birth Doula',
            description:
              'A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.',
            createdAt: '2025-12-27T19:54:43.687Z',
            updatedAt: '2025-12-27T19:54:43.687Z',
          },
          {
            id: '41bb32e6-ae80-4a9c-8cd9-855f98ced1b2',
            name: 'Post Partum Doula',
            description:
              'A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.',
            createdAt: '2025-12-27T19:54:37.168Z',
            updatedAt: '2025-12-27T19:54:37.168Z',
          },
        ],
      },
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
        status: 'success',
        message: 'Request successful',
        data: {
          id: '26c11b42-417c-4e37-8543-4ef609646718',
          name: 'Birth Doula',
          description:
            'A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.',
          createdAt: '2025-12-27T19:54:43.687Z',
          updatedAt: '2025-12-27T19:54:43.687Z',
        },
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
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          id: '26c11b42-417c-4e37-8543-4ef609646718',
          name: 'Birth Doula',
          description:
            'Birth Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.',
          createdAt: '2025-12-27T19:54:43.687Z',
          updatedAt: '2025-12-31T04:56:20.466Z',
        },
      },
    },
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
    schema: {
      example: {
        status: 'success',
        message: 'Request successful',
        data: {
          id: '46214841-05a5-45b0-9f04-cb6d2e5869ca',
          name: 'Post Partdddum Doula',
          description:
            'A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.',
          createdAt: '2025-12-31T04:57:22.094Z',
          updatedAt: '2025-12-31T04:57:22.094Z',
        },
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
