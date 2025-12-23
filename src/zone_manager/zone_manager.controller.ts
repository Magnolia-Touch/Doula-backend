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
    UseInterceptors,
    BadRequestException,
    UploadedFiles,
    Req,
} from '@nestjs/common';
import { ZoneManagerService } from './zone_manager.service';
import { CreateZoneManagerDto } from './dto/create-zone-manager.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { BookingStatus, Role, ServiceStatus } from '@prisma/client';
import { RegionAssignmentCheckDto, UpdateZoneManagerRegionDto } from './dto/update-zone-manager.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function multerStorage() {
    return diskStorage({
        destination: (req, file, cb) => {
            // ensure this folder exists (create on app init or manually)
            cb(null, './uploads/manager');
        },
        filename: (req, file, cb) => {
            const safeName =
                Date.now() + '-' + Math.round(Math.random() * 1e9) + extname(file.originalname);
            cb(null, safeName);
        },
    });
}


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
    @UseInterceptors(
        FileFieldsInterceptor(
            [{ name: 'profile_image', maxCount: 1 }],
            {
                storage: multerStorage(),
                limits: { fileSize: MAX_FILE_SIZE },
                fileFilter: (req, file, cb) => {
                    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
                    else cb(new BadRequestException('Unsupported file type'), false);
                },
            },
        ),
    )
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Create Zone Manager' })
    @ApiBody({ type: CreateZoneManagerDto })   // <-- REQUIRED
    create(@Body() dto: CreateZoneManagerDto,
        @UploadedFiles()
        files: {
            profile_image?: Express.Multer.File[];
        },) {
        // validate file presence/size etc (Multer already limits size)
        const profileImage = files?.profile_image?.[0];

        let profileImageUrl: string | undefined;

        if (profileImage) {
            // double-check mimetype and size (extra safety)
            if (!ALLOWED_IMAGE_TYPES.includes(profileImage.mimetype)) {
                // remove saved file (optional cleanup) and throw
                throw new BadRequestException('Unsupported image type.');
            }
            if (profileImage.size > MAX_FILE_SIZE) {
                throw new BadRequestException('Profile image exceeds maximum size of 5 MB.');
            }

            // Construct a URL or a path to store in DB. Two options:
            // 1) store relative path and serve with ServeStaticModule
            // 2) store full public URL if hosted
            // Here we store a relative path (uploads/doulas/<filename>)
            profileImageUrl = `uploads/manager/${profileImage.filename}`;
        }
        return this.service.create(dto, profileImageUrl);
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ZONE_MANAGER)
    @Get('schedules/list')
    async getSchedules(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: ServiceStatus,
        @Query('serviceName') serviceName?: string,
        @Query('date') date?: string,
    ) {
        return this.service.getZoneManagerSchedules(
            req.user.id,
            Number(page) || 1,
            Number(limit) || 10,
            {
                status,
                serviceName,
                date,
            },
        );
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ZONE_MANAGER)
    @Get('booked-services/list')
    @Roles(Role.ZONE_MANAGER)
    async getBookedServices(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('serviceName') serviceName?: string,
        @Query('status') status?: BookingStatus,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.service.getZoneManagerBookedServices(
            req.user.id,
            Number(page) || 1,
            Number(limit) || 10,
            {
                serviceName,
                status,
                startDate,
                endDate,
            },
        );

    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ZONE_MANAGER)
    @Get('meetings/list')
    async getZoneManagerMeetings(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.service.getZoneManagerMeetings(
            req.user.id,
            Number(page) || 1,
            Number(limit) || 10,
            search?.trim(),
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ZONE_MANAGER)
    @Get('schedules/list/:id')
    async getScheduleById(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.service.getZoneManagerScheduleById(req.user.id, id);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ZONE_MANAGER)
    @Get('booked-services/list/:id')
    async getBookedServiceById(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.service.getZoneManagerBookedServiceById(req.user.id, id);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ZONE_MANAGER)
    @Get('meetings/list/:id')
    async getMeetingById(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.service.getZoneManagerMeetingById(req.user.id, id);
    }


}
