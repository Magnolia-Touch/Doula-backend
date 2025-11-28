import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { EnquiryService } from './enquiry-forms.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';

@ApiTags('Enquiry Forms')
@Controller({
    path: 'enquiry/form',
    version: '1',
})
export class EnquiryController {
    constructor(private readonly enquiryService: EnquiryService) { }

    @ApiOperation({ summary: 'Submit an enquiry form' })
    @ApiBody({ type: EnquiryFormDto })
    @ApiResponse({
        status: 201,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Enquiry submitted successfully',
                data: { id: 'enquiry-uuid', name: 'John Doe', serviceId: 'service-uuid' },
            },
        },
    })
    @Post()
    async submit(@Body() dto: EnquiryFormDto) {
        return this.enquiryService.submitEnquiry(dto);
    }

    @ApiOperation({ summary: 'Get paginated list of enquiries' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Enquiries fetched',
                data: {
                    items: [{ id: 'e1', name: 'John Doe', serviceId: 's1' }],
                    total: 1,
                    page: 1,
                    limit: 10,
                },
            },
        },
    })
    @Get()
    getAllEnquiries(@Query('page') page = '1', @Query('limit') limit = '10') {
        return this.enquiryService.getAllEnquiries(parseInt(page), parseInt(limit));
    }

    @ApiOperation({ summary: 'Get enquiry by ID' })
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Enquiry fetched',
                data: { id: 'enquiry-uuid', name: 'Jane', email: 'jane@example.com' },
            },
        },
    })
    @Get(':id')
    getEnquiryById(@Param('id') id: string) {
        return this.enquiryService.getEnquiryById(id);
    }

    @ApiOperation({ summary: 'Delete enquiry' })
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: { example: { success: true, message: 'Enquiry deleted', data: null } },
    })
    @Delete(':id')
    deleteEnquiry(@Param('id') id: string) {
        return this.enquiryService.deleteEnquiry(id);
    }

    @ApiOperation({ summary: 'Delete all enquiries' })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: { example: { success: true, message: 'All enquiries deleted', data: null } },
    })
    @Delete()
    deleteallEnquiry() {
        return this.enquiryService.deleteAllEnquiryForms();
    }
}
