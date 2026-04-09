import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DoulaJoinEnquiryService } from './doula-join-enquiry.service';
import { CreateDoulaJoinEnquiryDto } from './dto/create-doula-join-enquiry.dto';
import { UpdateDoulaJoinEnquiryDto } from './dto/update-doula-join-enquiry.dto';
import { JoinEnquiryStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Doula Join Enquiries')
@Controller({
  path: 'doula-join-enquiries',
  version: '1',
})
export class DoulaJoinEnquiryController {
  constructor(
    private readonly doulaJoinEnquiryService: DoulaJoinEnquiryService,
  ) { }

  @ApiOperation({
    summary: 'Submit a doula join enquiry',
    description:
      'Submit an application to join as a doula. This is a public endpoint for prospective doulas to submit their interest.',
  })
  @ApiBody({ type: CreateDoulaJoinEnquiryDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    description: 'Enquiry submitted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Join enquiry submitted successfully',
        data: {
          id: 'enquiry-uuid-123',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1-234-567-8900',
          status: 'PENDING',
          createdAt: '2025-12-09T10:30:00.000Z',
          updatedAt: '2025-12-09T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Post()
  create(@Body() dto: CreateDoulaJoinEnquiryDto) {
    return this.doulaJoinEnquiryService.create(dto);
  }

  @ApiOperation({
    summary: 'Get all doula join enquiries',
    description:
      'Retrieve all doula join enquiries with pagination and status filtering. Admin only.',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of records per page (default: 10)',
  })
  @ApiQuery({
    name: 'status',
    enum: JoinEnquiryStatus,
    required: false,
    description: 'Filter by enquiry status',
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Enquiries retrieved successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Enquiries fetched successfully',
        data: {
          items: [
            {
              id: 'enquiry-uuid-123',
              name: 'Sarah Johnson',
              email: 'sarah@example.com',
              phone: '+1-234-567-8900',
              status: 'PENDING',
              createdAt: '2025-12-09T10:30:00.000Z',
              updatedAt: '2025-12-09T10:30:00.000Z',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: JoinEnquiryStatus,
  ) {
    return this.doulaJoinEnquiryService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      status,
    );
  }

  @ApiOperation({
    summary: 'Get a specific doula join enquiry',
    description: 'Retrieve details of a specific doula join enquiry by ID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Enquiry ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Enquiry retrieved successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Enquiry fetched successfully',
        data: {
          id: 'enquiry-uuid-123',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1-234-567-8900',
          status: 'PENDING',
          createdAt: '2025-12-09T10:30:00.000Z',
          updatedAt: '2025-12-09T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Enquiry not found' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doulaJoinEnquiryService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update a doula join enquiry',
    description:
      'Update the status or details of a doula join enquiry. Admin only.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Enquiry ID (UUID)',
  })
  @ApiBody({ type: UpdateDoulaJoinEnquiryDto })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Enquiry updated successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Enquiry updated successfully',
        data: {
          id: 'enquiry-uuid-123',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1-234-567-8900',
          status: 'APPROVED',
          updatedAt: '2025-12-09T11:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Enquiry not found' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDoulaJoinEnquiryDto) {
    return this.doulaJoinEnquiryService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete a doula join enquiry',
    description: 'Delete a doula join enquiry by ID. Admin only.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Enquiry ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    description: 'Enquiry deleted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Enquiry deleted successfully',
        data: { id: 'enquiry-uuid-123' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Enquiry not found' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doulaJoinEnquiryService.remove(id);
  }
}
