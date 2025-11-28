import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Query,
    Param,
    Delete,
    Patch,
} from '@nestjs/common';
import { ZoneManagerService } from './zone_manager.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RegionAssignmentCheckDto, UpdateZoneManagerRegionDto } from './dto/update-zone-manager.dto';

@ApiTags('Zone Managers')
@ApiBearerAuth()
@Controller({
    path: 'zonemanager',
    version: '1',
})
export class ZoneManagerController {
    constructor(private readonly service: ZoneManagerService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Create Zone Manager' })
    create(@Body() dto: CreateZoneManagerDto) {
        return this.service.create(dto);
    }


    @Get()
    @ApiOperation({ summary: 'Get zone managers list' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    getZoneManagers(
        @Query('page') page = 1,
        @Query('limit') limit = 3,
        @Query('search') search?: string,
    ) {
        return this.service.get(Number(page), Number(limit), search);
    }


    @Get(':id')
    @ApiOperation({ summary: 'Get Zone Manager by ID' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'UUID of the Zone Manager',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Zone Manager fetched successfully.',
        schema: {
            example: {
                message: 'Zone Manager fetched successfully',
                data: {
                    id: '87c0aaee-b4f8-4d62-b0bc-72246ff312ab',
                    name: 'John Doe',
                    email: 'john@gmail.com',
                    role: 'ZONE_MANAGER',
                    zonemanagerprofile: {
                        id: 'ec25d03a-dba5-43d3-b56e-7a546ec2da9f',
                        region: 'North Zone',
                        phone: '9876543210',
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Zone Manager not found',
    })
    async getZoneManagerById(@Param('id') id: string) {
        return this.service.getById(id);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete Zone Manager' })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'UUID of the Zone Manager',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Zone Manager Deleted successfully.',
        schema: {
            example: {
                message: 'Zone Manager Deleted successfully',
                data: {
                    id: '87c0aaee-b4f8-4d62-b0bc-72246ff312ab',
                    name: 'John Doe',
                    email: 'john@gmail.com',
                    role: 'ZONE_MANAGER',
                    zonemanagerprofile: {
                        id: 'ec25d03a-dba5-43d3-b56e-7a546ec2da9f',
                        region: 'North Zone',
                        phone: '9876543210',
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Zone Manager not found',
    })
    async delete(@Param('id') id: string) {
        return this.service.delete(id);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation(({ summary: "Update Status of Zone Manager" }))
    @ApiParam({
        name: 'id',
        type: String,
        description: 'UUID of the Zone Manager',
        required: true,
    })
    @ApiBody({
        description: 'Status update payload',
        schema: {
            example: {
                isActive: true,
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Zone Manager status updated successfully',
        schema: {
            example: {
                message: 'Zone Manager status updated successfully',
                data: {
                    id: '3fd8c6b4-74db-4b3e-afdd-fa3a77c7465e',
                    name: 'John Doe',
                    email: 'john@gmail.com',
                    role: 'ZONE_MANAGER',
                    is_active: true,
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Zone Manager not found',
    })
    @Patch(':id/update/status')
    async UpdateManagerStatus(@Param('id') id: string,
        @Body('isActive') isActive: boolean) {
        return this.service.updateStatus(id, isActive)
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('assign/region')
    @ApiOperation({ summary: 'Assign a Region to a Zone Manager' })
    @ApiBody({
        type: UpdateZoneManagerRegionDto,
        description: 'Provide Zone Manager Profile ID and Region ID',
        schema: {
            example: {
                profileId: '4cb9ddc3-4766-46be-86a7-7c5bdf1b82d5',
                regionId: '96efbdce-d7cb-43bb-8787-626c198be1a4',
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Region successfully assigned',
        schema: {
            example: {
                message: 'Region successfully Assigned',
                data: {
                    id: '96efbdce-d7cb-43bb-8787-626c198be1a4',
                    regionName: 'Bangalore West',
                    district: 'Bangalore',
                    state: 'Karnataka',
                    country: 'India',
                    zoneManagerId: '4cb9ddc3-4766-46be-86a7-7c5bdf1b82d5',
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Zone Manager Profile or Region not found',
    })
    async assignRegionToManager(
        @Body() dto: UpdateZoneManagerRegionDto
    ) {
        return this.service.UpdateZoneManagerRegions(dto);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get("region/assignment-status")
    @ApiOperation({ summary: "Check whether regions are already assigned to a Zone Manager" })
    @ApiBody({ type: RegionAssignmentCheckDto })
    @ApiResponse({
        status: 200,
        description: "Region assignment status fetched",
        schema: {
            example: {
                message: "Region assignment status fetched",
                assignedCount: 1,
                unassignedCount: 1,
                assigned: [
                    {
                        id: "96efbdce-d7cb-43bb-8787-626c198be1a4",
                        regionName: "Bangalore East",
                        zoneManagerId: "9e9c77fa-2cd4-4d92-b7cb-4f6851f1f3a8"
                    }
                ],
                unassigned: [
                    {
                        id: "4fd68b32-cb85-4f8b-9375-d4477dc7c3ae",
                        regionName: "Chennai North",
                        zoneManagerId: null
                    }
                ]
            }
        }
    })
    @ApiResponse({ status: 404, description: "One or more region IDs are invalid" })
    async regionAlreadyAssignedOrNot(@Body() dto: RegionAssignmentCheckDto) {
        return this.service.regionAlreadyAssignedOrNot(dto.regionIds);
    }




}
