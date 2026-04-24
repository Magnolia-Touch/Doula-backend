import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { CreateDirectTestimonialDto } from './dto/create-direct-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import {
  FilterTestimonialsDto,
  GetZmTestimonialDto,
} from './dto/filter-testimonials.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Testimonials')
@ApiBearerAuth()
@Controller({
  path: 'testimonials',
  version: '1',
})
export class TestimonialsController {
  constructor(private readonly service: TestimonialsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({
    summary: 'Create testimonial',
    description:
      'Allows a client to create a testimonial for a completed service',
  })
  @ApiBody({
    type: CreateTestimonialDto,
    schema: {
      example: {
        doulaProfileId: 'doula-uuid',
        serviceId: 'service-uuid',
        ratings: 5,
        reviews: 'Excellent service!',
      },
    },
  })
  create(@Body() dto: CreateTestimonialDto, @Req() req) {
    return this.service.create(dto, req.user.id);
  }

  @Post('direct')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create testimonial directly (Admin)',
    description:
      'Allows admin to add testimonials directly by creating/reusing client details without purchase verification',
  })
  @ApiBody({
    type: CreateDirectTestimonialDto,
    schema: {
      example: {
        doulaProfileId: 'doula-uuid',
        servicePricingId: 'service-pricing-uuid',
        clientName: 'Ananya Rao',
        clientEmail: 'ananya.rao@example.com',
        clientPhone: '+919876543210',
        ratings: 5,
        reviews: 'Very kind and professional support.',
      },
    },
  })
  createDirect(@Body() dto: CreateDirectTestimonialDto) {
    return this.service.createDirect(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all testimonials',
    description: 'Fetch testimonials with optional filters and pagination',
  })
  @ApiQuery({
    name: 'doulaId',
    required: false,
    description: 'Filter by doula ID',
  })
  @ApiQuery({
    name: 'serviceId',
    required: false,
    description: 'Filter by service ID',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findAll(@Query() query: FilterTestimonialsDto) {
    return this.service.findAll(query);
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Get testimonial by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Testimonial UUID',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({
    summary: 'Update testimonial',
    description: 'Allows client to update their own testimonial',
  })
  @ApiParam({
    name: 'id',
    description: 'Testimonial UUID',
  })
  @ApiBody({ type: UpdateTestimonialDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialDto,
    @Req() req,
  ) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({
    summary: 'Delete testimonial',
    description: 'Allows client to delete their own testimonial',
  })
  @ApiParam({
    name: 'id',
    description: 'Testimonial UUID',
  })
  remove(@Param('id') id: string, @Req() req) {
    return this.service.remove(id, req.user.id);
  }

  @Get('recent/testimonials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @ApiOperation({
    summary: 'Get recent testimonials (Zone Manager)',
    description: 'Returns recent testimonials related to the zone manager',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getTestimonials(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.getZoneManagerTestimonials(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  @Get('all/testimonials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @ApiOperation({
    summary: 'Get all testimonials (Zone Manager)',
    description: 'Fetch all testimonials with advanced filters and pagination',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getAllzmTestimonial(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() dto: GetZmTestimonialDto,
  ) {
    const zoneManagerId = req.user.id; // authenticated user ID
    return this.service.getAllzmTestimonial(
      req.user.id,
      dto,
      Number(page),
      Number(limit),
    );
  }

  @Get('all/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @ApiOperation({
    summary: 'Get testimonial summary (Zone Manager)',
    description:
      'Returns aggregated testimonial statistics for the zone manager',
  })
  async getZmTestimonialSummary(@Req() req) {
    const zoneManagerId = req.user.id; // authenticated user ID
    return this.service.getZmTestimonialSummary(req.user.id);
  }
}
