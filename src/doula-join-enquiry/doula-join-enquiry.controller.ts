import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    Query,
} from '@nestjs/common';
import { DoulaJoinEnquiryService } from './doula-join-enquiry.service';
import { CreateDoulaJoinEnquiryDto } from './dto/create-doula-join-enquiry.dto';
import { UpdateDoulaJoinEnquiryDto } from './dto/update-doula-join-enquiry.dto';

@Controller({
    path: 'doula-join-enquiries',
    version: '1',
})
export class DoulaJoinEnquiryController {
    constructor(
        private readonly doulaJoinEnquiryService: DoulaJoinEnquiryService,
    ) { }

    @Post()
    create(@Body() dto: CreateDoulaJoinEnquiryDto) {
        return this.doulaJoinEnquiryService.create(dto);
    }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.doulaJoinEnquiryService.findAll(
            Number(page) || 1,
            Number(limit) || 10,
        );
    }


    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.doulaJoinEnquiryService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateDoulaJoinEnquiryDto,
    ) {
        return this.doulaJoinEnquiryService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.doulaJoinEnquiryService.remove(id);
    }
}
