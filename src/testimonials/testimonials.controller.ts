import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { FilterTestimonialsDto } from './dto/filter-testimonials.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

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
    @ApiOperation({ summary: 'Create testimonial' })
    @ApiBody({
        type: CreateTestimonialDto,
        schema: {
            example: {
                doulaProfileId: 'uuid',
                serviceId: 'uuid',
                ratings: 5,
                reviews: 'Excellent service!',
            },
        },
    })
    create(@Body() dto: CreateTestimonialDto, @Req() req) {
        return this.service.create(dto, req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all testimonials with filters' })
    @ApiQuery({ name: 'doulaId', required: false })
    @ApiQuery({ name: 'serviceId', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    findAll(@Query() query: FilterTestimonialsDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get testimonial by ID' })
    @ApiParam({ name: 'id' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.CLIENT)
    @Patch(':id')
    @ApiOperation({ summary: 'Update testimonial' })
    update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto, @Req() req) {
        return this.service.update(id, dto, req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.CLIENT)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete testimonial' })
    remove(@Param('id') id: string, @Req() req) {
        return this.service.remove(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ZONE_MANAGER)
    @Get('recent/testimonials')
    async getTestimonials(@Req() req, @Query('page') page = 1, @Query('limit') limit = 10) {
        const zoneManagerId = req.user.id; // authenticated user ID
        return this.service.getZoneManagerTestimonials(zoneManagerId, Number(page), Number(limit));
    }
}
