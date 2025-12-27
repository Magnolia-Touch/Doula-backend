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
import { CreateDoulaServiceAvailabilityDto, UpdateDoulaServiceAvailabilityDto } from './dto/service-availability.dto';
import { CreateDoulaOffDaysDto, UpdateDoulaOffDaysDto } from './dto/off-days.dto';

@ApiTags('Doula Service Availability')
@ApiBearerAuth('bearer')
@Controller({
  path: 'service/availability',
  version: '1',
})
export class DoulaServiceAvailabilityController {
  constructor(private readonly service: DoulaServiceAvailabilityService) { }

  // CREATE SLOTS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Post()
  async createAvailability(@Body() dto: CreateDoulaServiceAvailabilityDto, @Req() req) {
    return this.service.createAvailability(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get()
  async findAll(@Req() req) {
    return this.service.findAll(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req) {
    return this.service.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Patch(":id")
  async update(@Param("id") id: string, @Req() req, @Body() dto: UpdateDoulaServiceAvailabilityDto) {
    return this.service.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req) {
    return this.service.remove(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Post("doula/off-days")
  async createOffDays(
    @Body() dto: CreateDoulaOffDaysDto,
    @Req() req,
  ) {
    return this.service.createOffDays(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get("doula/off-days")
  async getOffDays(
    @Req() req,
  ) {
    console.log(11)
    return this.service.getOffDays(req.user);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('doula/off-days/:id')
  async getOffdaysbyId(
    @Param("id") id: string,
    @Req() req,
  ) {
    return this.service.getOffdaysbyId(id, req.user);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Patch('doula/off-days/:id')
  async updateOffdays(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoulaOffDaysDto,
    @Req() req,
  ) {
    return this.service.updateOffdays(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Delete('doula/off-days/:id')
  async removeOffdays(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    return this.service.removeOffdays(id, req.user);
  }

}
