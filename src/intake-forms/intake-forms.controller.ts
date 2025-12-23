import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { IntakeFormService } from './intake-forms.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';

@ApiTags('Intake Forms')
@Controller({
  path: 'intake/forms',
  version: '1',
})
export class IntakeFormController {
  constructor(private readonly intakeService: IntakeFormService) {}

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Intake Form' })
  @ApiBody({ type: IntakeFormDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Intake form created',
        data: {
          id: 'intake-uuid',
          name: 'Jane Doe',
          email: 'jane@example.com',
          slotId: 'slot-uuid',
          doulaProfileId: 'doula-uuid',
          serviceId: 'service-uuid',
        },
      },
    },
  })
  @Post()
  create(@Body() dto: IntakeFormDto) {
    return this.intakeService.createIntakeForm(dto);
  }

  @ApiOperation({ summary: 'Get paginated intake forms' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Intake forms fetched',
        data: {
          items: [{ id: 'i1', name: 'Jane', serviceId: 's1' }],
          total: 1,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  @Get()
  getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.intakeService.getAllForms(+page, +limit);
  }

  @ApiOperation({ summary: 'Get intake form by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Intake form fetched',
        data: {
          id: 'intake-uuid',
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      },
    },
  })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.intakeService.getFormById(id);
  }

  @ApiOperation({ summary: 'Delete Intake Form' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: { success: true, message: 'Intake form deleted', data: null },
    },
  })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.intakeService.deleteForm(id);
  }

  @ApiOperation({ summary: 'Delete all intake forms' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'All intake forms deleted',
        data: null,
      },
    },
  })
  @Delete()
  deleteallEnquiry() {
    return this.intakeService.deleteAllIntakeForms();
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Book Doula Service' })
  @ApiBody({ type: BookDoulaDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Intake form created',
        data: {
          id: 'intake-uuid',
          name: 'Jane Doe',
          email: 'jane@example.com',
          slotId: 'slot-uuid',
          doulaProfileId: 'doula-uuid',
          serviceId: 'service-uuid',
        },
      },
    },
  })
  @Post('book/doula')
  BookDoula(@Body() dto: BookDoulaDto, @Req() req) {
    return this.intakeService.BookDoula(dto, req.user.id);
  }
}
