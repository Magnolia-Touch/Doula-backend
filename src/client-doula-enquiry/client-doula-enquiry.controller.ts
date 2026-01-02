import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ClientDoulaEnquiryService } from './client-doula-enquiry.service';
import { CreateClientDoulaEnquiryDto } from './dto/create-client-doula-enquiry.dto';
import { UpdateClientDoulaEnquiryDto } from './dto/update-client-doula-enquiry.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('client-doula-enquiries')
export class ClientDoulaEnquiryController {
    constructor(
        private readonly service: ClientDoulaEnquiryService,
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ZONE_MANAGER)
    @Post()
    create(@Body() dto: CreateClientDoulaEnquiryDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateClientDoulaEnquiryDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
