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
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import {
  BookingStatus,
  MeetingStatus,
  Role,
  ServiceStatus,
} from '@prisma/client';
import {
  RegionAssignmentCheckDto,
  UpdateZoneManagerRegionDto,
} from './dto/update-zone-manager.dto';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateDoulaProfileDto } from 'src/doula/dto/update-doula.dto';
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
        Date.now() +
        '-' +
        Math.round(Math.random() * 1e9) +
        extname(file.originalname);
      cb(null, safeName);
    },
  });
}


function multerStoragedoula() {
  return diskStorage({
    destination: (req, file, cb) => {
      // ensure this folder exists (create on app init or manually)
      cb(null, './uploads/doulas');
    },
    filename: (req, file, cb) => {
      const safeName =
        Date.now() +
        '-' +
        Math.round(Math.random() * 1e9) +
        extname(file.originalname);
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
    FileFieldsInterceptor([{ name: 'profile_image', maxCount: 1 }], {
      storage: multerStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Unsupported file type'), false);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Zone Manager' })
  @ApiBody({ type: CreateZoneManagerDto }) // <-- REQUIRED
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        "status": "success",
        "message": "Zone Manager created successfully",
        "data": {
          "id": "386acafc-f7f0-4ad8-887a-9120d94cc4ae",
          "name": "devanand",
          "email": "devvv@gmail.com",
          "phone": "+918921236345",
          "otp": null,
          "otpExpiresAt": null,
          "role": "ZONE_MANAGER",
          "is_active": true,
          "createdAt": "2025-12-03T09:59:07.066Z",
          "updatedAt": "2025-12-03T09:59:07.066Z",
          "zonemanagerprofile": {
            "id": "3aa1427e-90f2-4dc2-95c3-890690e3f857",
            "userId": "386acafc-f7f0-4ad8-887a-9120d94cc4ae",
            "profile_image": "uploads/manager/1764755947060-99108560.png",
            "createdAt": "2025-12-03T09:59:07.066Z",
            "updatedAt": "2025-12-03T09:59:07.066Z"
          }
        }
      }
    },
  })
  create(
    @Body() dto: CreateZoneManagerDto,
    @UploadedFiles()
    files: {
      profile_image?: Express.Multer.File[];
    },
  ) {
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
        throw new BadRequestException(
          'Profile image exceeds maximum size of 5 MB.',
        );
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
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Zone Managers fetched successfully",
        "data": [
          {
            "userId": "55f12bf3-317f-4157-8aa0-0d979e3e8fa7",
            "name": "Adam Smith",
            "email": "zonemanager@test.com",
            "phone": "+918843488338",
            "role": "ZONE_MANAGER",
            "is_active": true,
            "profileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
            "regions": [
              "North Mumbai"
            ],
            "doulas": [
              "Anita Sharma"
            ]
          }
        ],
        "meta": {
          "total": 1,
          "page": 1,
          "limit": 1,
          "totalPages": 1,
          "hasNextPage": false,
          "hasPrevPage": false
        }
      }
    }
  })
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
        "status": "success",
        "message": "Zone Manager fetched successfully",
        "data": {
          "userId": "55f12bf3-317f-4157-8aa0-0d979e3e8fa7",
          "name": "Adam Smith",
          "email": "zonemanager@test.com",
          "phone": "+918843488338",
          "role": "ZONE_MANAGER",
          "is_active": true,
          "profileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
          "regions": [
            {
              "id": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
              "regionName": "North Mumbai",
              "pincode": "4999022",
              "district": "Mumbai Suburban",
              "state": "Maharashtra",
              "country": "India",
              "latitude": "19.1136",
              "longitude": "72.8697",
              "is_active": true
            }
          ],
          "doulas": [
            {
              "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
              "userId": "a0f185ed-8c28-4316-ac07-dbdc7dce8f38",
              "name": "Anita Sharma",
              "email": "doula@test.com",
              "phone": "+919876543342",
              "is_active": true,
              "description": "Certified birth doula with 6+ years of experience",
              "qualification": "Certified Birth Doula (CBD)",
              "achievements": "Supported 300+ successful births",
              "yoe": 6,
              "languages": [
                "English",
                "Hindi",
                "Tamil"
              ],
              "regions": [
                {
                  "id": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
                  "regionName": "North Mumbai",
                  "pincode": "4999022",
                  "district": "Mumbai Suburban",
                  "state": "Maharashtra",
                  "country": "India"
                }
              ]
            }
          ]
        }
      }
    },
  })
  @ApiResponse({
    schema: {
      example: {
        "message": "Zone Manager not found",
        "error": "Not Found",
        "statusCode": 404
      }
    }
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
        "status": "success",
        "message": "Zone Manager deleted successfully",
        "data": {
          "message": "Zone Manager deleted successfully",
          "data": null
        }
      }
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
  @ApiOperation({ summary: 'Update Status of Zone Manager' })
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
        "status": "success",
        "message": "Zone Manager status updated successfully",
        "data": {
          "id": "9f9bc3d6-05fc-4f1f-b5b3-d9a07117bff7",
          "name": "Jane Doe",
          "email": "zonemanager@gmail.com",
          "phone": "+911234567891",
          "otp": null,
          "otpExpiresAt": null,
          "role": "ZONE_MANAGER",
          "is_active": false,
          "createdAt": "2025-11-25T14:25:31.492Z",
          "updatedAt": "2025-11-25T14:25:44.676Z"
        }
      }
    },
  })
  @Patch(':id/update/status')
  async UpdateManagerStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.service.updateStatus(id, isActive);
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
        "profileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
        "regionIds": [
          "3ffb3715-0f31-47cb-b2a8-d62bb36f2ce9"
        ],
        "purpose": "add" //add or remove
      }
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Region successfully assigned',
    schema: {
      example: {
        "status": "success",
        "message": "1 Region(s) successfully assigned to Manager",
        "data": {
          "message": "1 Region(s) successfully assigned to Manager"
        }
      }
    },
  })
  async assignRegionToManager(@Body() dto: UpdateZoneManagerRegionDto) {
    return this.service.UpdateZoneManagerRegions(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('region/assignment-status')
  @ApiOperation({
    summary: 'Check whether regions are already assigned to a Zone Manager',
  })
  @ApiBody({ type: RegionAssignmentCheckDto })
  @ApiResponse({
    status: 200,
    description: 'Region assignment status fetched',
    schema: {
      example: {
        "status": "success",
        "message": "Region assignment status fetched",
        "data": {
          "message": "Region assignment status fetched",
          "assignedCount": 2,
          "unassignedCount": 0,
          "assigned": [
            {
              "id": "3ffb3715-0f31-47cb-b2a8-d62bb36f2ce9",
              "regionName": "Texas",
              "zoneManagerId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50"
            },
            {
              "id": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
              "regionName": "North Mumbai",
              "zoneManagerId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50"
            }
          ],
          "unassigned": []
        }
      }
    },
  })
  @ApiResponse({
    status: 404,
    description: 'One or more region IDs are invalid',
  })
  async regionAlreadyAssignedOrNot(@Body() dto: RegionAssignmentCheckDto) {
    return this.service.regionAlreadyAssignedOrNot(dto.regionIds);
  }


  @ApiOperation({ description: "Fetch All Service Schedules that fall under Zone Manager" })
  @ApiBearerAuth("acccess-token")
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Schedules fetched successfully",
        "data": [
          {
            "scheduleId": "192aec93-cf39-4aa2-a906-43795aea485e",
            "clientId": "43d9b6d3-727c-4e09-9b0d-42b6c231ee70",
            "clientName": "shambu",
            "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
            "doulaName": "Anita Sharma",
            "serviceName": "Post Partum Doula",
            "startDate": "NIGHT",
            "status": "PENDING"
          },
          {
            "scheduleId": "4fc39667-aa82-4b53-80c6-8dca2ddfd2ea",
            "clientId": "43d9b6d3-727c-4e09-9b0d-42b6c231ee70",
            "clientName": "shambu",
            "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
            "doulaName": "Anita Sharma",
            "serviceName": "Post Partum Doula",
            "startDate": "NIGHT",
            "status": "PENDING"
          }
        ],
        "meta": {
          "total": 54,
          "page": 1,
          "limit": 2,
          "totalPages": 27,
          "hasNextPage": true,
          "hasPrevPage": false
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('schedules/list')
  async getSchedules(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ServiceStatus,
    @Query('search') search?: string,
    @Query('date') date?: string,
    @Query('serviceName') serviceName?: string,

  ) {
    return this.service.getZoneManagerSchedules(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 10,
      {
        serviceName,
        status,
        search,
        date,
      },
    );
  }



  @ApiOperation({ description: "Fetch All Service Bookings that fall under Zone Manager" })
  @ApiBearerAuth("acccess-token")
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Booked services fetched successfully",
        "data": [
          {
            "bookingId": "c2c68373-954b-4c15-b11c-232ee92a5968",
            "clientId": "6af732ef-8b4a-4097-98fb-ff0fa165afff",
            "clientName": "test client",
            "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
            "doulaName": "Anita Sharma",
            "servicePricingId": "f00e2a99-b097-4c3c-9783-75d5d09ba497",
            "serviceName": "Birth Doula",
            "startDate": "2042-09-01T00:00:00.000Z",
            "endDate": "2042-10-31T00:00:00.000Z",
            "status": "ACTIVE"
          }
        ],
        "meta": {
          "total": 10,
          "page": 1,
          "limit": 1,
          "totalPages": 10,
          "hasNextPage": true,
          "hasPrevPage": false
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('booked-services/list')
  @Roles(Role.ZONE_MANAGER)
  async getBookedServices(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: BookingStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('serviceName') serviceName?: string,
  ) {
    return this.service.getZoneManagerBookedServices(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 10,
      {
        serviceName,
        search,
        status,
        startDate,
        endDate,


      },
    );
  }


  @ApiOperation({ description: "Fetch All Meetings that fall under Zone Manager" })
  @ApiBearerAuth("acccess-token")
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Zone manager meetings fetched successfully",
        "data": [
          {
            "meetingId": "dfb37e07-08cb-4da2-8224-e990b7a22da1",
            "clientId": "235248e1-c73a-44d6-b82b-4456a8485010",
            "clientName": "fayazbroz",
            "doulaId": null,
            "doulaName": null,
            "servicePricingId": null,
            "serviceName": "Birth Doula",
            "startDate": "1970-01-01T03:30:00.000Z",
            "endDate": "1970-01-01T04:00:00.000Z",
            "status": "SCHEDULED"
          }
        ],
        "meta": {
          "total": 1,
          "page": 1,
          "limit": 10,
          "totalPages": 1,
          "hasNextPage": false,
          "hasPrevPage": false
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('meetings/list')
  async getZoneManagerMeetings(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: MeetingStatus,
  ) {
    return this.service.getZoneManagerMeetings(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 10,
      search?.trim(),
      status,
    );
  }

  @ApiOperation({ description: "Retrieve each Schedules using uuid" })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Schedule fetched successfully",
        "data": {
          "scheduleId": "192aec93-cf39-4aa2-a906-43795aea485e",
          "clientId": "43d9b6d3-727c-4e09-9b0d-42b6c231ee70",
          "clientName": "shambu",
          "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
          "doulaName": "Anita Sharma",
          "serviceName": "Post Partum Doula",
          "startDate": "NIGHT",
          "status": "PENDING"
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('schedules/list/:id')
  async getScheduleById(@Req() req: any, @Param('id') id: string) {
    return this.service.getZoneManagerScheduleById(req.user.id, id);
  }



  @ApiOperation({ description: "Retrieve each Bookings using uuid" })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Booked service fetched successfully",
        "data": {
          "serviceBookingId": "c2c68373-954b-4c15-b11c-232ee92a5968",
          "clientId": "6af732ef-8b4a-4097-98fb-ff0fa165afff",
          "clientName": "test client",
          "doulaId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
          "doulaName": "Anita de Asam",
          "servicePricingId": "f00e2a99-b097-4c3c-9783-75d5d09ba497",
          "serviceName": "Birth Doula",
          "startDate": "2042-09-01T00:00:00.000Z",
          "endDate": "2042-10-31T00:00:00.000Z",
          "status": "ACTIVE"
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('booked-services/list/:id')
  async getBookedServiceById(@Req() req: any, @Param('id') id: string) {
    return this.service.getZoneManagerBookedServiceById(req.user.id, id);
  }



  @ApiOperation({ description: "Retrieve each Meetings using uuid" })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Meeting fetched successfully",
        "data": {
          "meetingId": "dfb37e07-08cb-4da2-8224-e990b7a22da1",
          "clientId": "235248e1-c73a-44d6-b82b-4456a8485010",
          "clientName": "fayazbroz",
          "doulaId": null,
          "doulaName": null,
          "servicePricingId": null,
          "serviceName": "Birth Doula",
          "startDate": "1970-01-01T03:30:00.000Z",
          "endDate": "1970-01-01T04:00:00.000Z",
          "status": "SCHEDULED"
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('meetings/list/:id')
  async getMeetingById(@Req() req: any, @Param('id') id: string) {
    return this.service.getZoneManagerMeetingById(req.user.id, id);
  }

  @ApiOperation({ description: "Fetch all Doulas under Zone Manager" })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Doulas fetched successfully",
        "data": [
          {
            "userId": "a0f185ed-8c28-4316-ac07-dbdc7dce8f38",
            "profileid": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
            "name": "Anita de Asam",
            "email": "doula@test.com",
            "phone": "+919876543342",
            "yoe": 2,
            "qualification": "",
            "languages": [],
            "specialities": [],
            "profileImage": "uploads/doulas/1767154501903-168020899.png"
          }
        ]
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('doulas/list')
  async getDoulasUnderZm(@Req() req: any) {
    return this.service.getDoulasUnderZm(req.user.id);
  }



  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload doula gallery images' })
  @ApiQuery({
    name: 'doulaId',
    required: true,
    description: 'Doula profile ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Gallery images (max 10)',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Gallery images uploaded successfully",
        "data": [
          {
            "id": "040170b7-688a-4058-adb5-0fcc83a2cfa2",
            "url": "uploads/doulas/1766572517976-31374491.png",
            "altText": null,
            "createdAt": "2025-12-24T10:35:17.983Z"
          },
          {
            "id": "6117a362-f8d4-452a-9728-7ca16dcb24fc",
            "url": "uploads/doulas/1766572517972-331472083.png",
            "altText": null,
            "createdAt": "2025-12-24T10:35:17.983Z"
          }
        ]
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Post('doulas/gallery/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multerStoragedoula(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file type'), false);
        }
      },
    }),
  )
  async addGalleryImages(
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('doulaId') doulaId: string,
  ) {
    return this.service.addDoulaGalleryImages(doulaId, files, req.user.id);
  }



  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Fetch Doula Gallery Images' })
  @ApiQuery({
    name: 'doulaId',
    required: true,
    description: 'Doula UserID',
  })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Doula gallery images fetched successfully",
        "data": [
          {
            "id": "003dd08a-fb13-4a2d-a004-76ffe49a5dfc",
            "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
            "url": "uploads/doulas/1767154479162-382266985.png",
            "altText": null,
            "createdAt": "2025-12-31T04:14:39.180Z"
          },
          {
            "id": "97c0e4c8-54c5-4f72-8120-86803a4a9592",
            "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
            "url": "uploads/doulas/1767154479164-287555438.png",
            "altText": null,
            "createdAt": "2025-12-31T04:14:39.180Z"
          },
          {
            "id": "57c4ba33-5029-4123-8051-ddfa6aad2b06",
            "doulaProfileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
            "url": "uploads/doulas/1767165269144-747759397.jpeg",
            "altText": null,
            "createdAt": "2025-12-31T07:14:29.154Z"
          }
        ]
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('doulas/gallery/images/')
  async getGalleryImages(@Req() req, @Query('doulaId') doulaId: string,) {
    return this.service.getDoulaGalleryImages(doulaId, req.user.id);
  }


  @ApiOperation({ summary: 'Fetch Doula Gallery Images' })
  @ApiQuery({
    name: 'doulaId',
    required: true,
    description: 'Doula UserID',
  })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Gallery image deleted successfully",
        "data": {
          "message": "Gallery image deleted successfully"
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Delete('doulas/gallery/images/:id')
  async deleteGalleryImage(@Req() req, @Param('id') imageId: string, @Query('doulaId') doulaId: string) {
    return this.service.deleteDoulaGalleryImage(doulaId, imageId, req.user.id);
  }




  @ApiOperation({ summary: 'Update Doula Profile as Zone Manager' })
  @ApiQuery({
    name: 'doulaId',
    required: true,
    description: 'Doula UserID',
  })
  @ApiBody({ type: UpdateDoulaProfileDto }) // <-- REQUIRED
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Doula profile fetched successfully",
        "data": {
          "id": "01be9f0d-8c08-4091-a0ce-eec44acb063c",
          "name": "Senior Doula",
          "title": "Certified Birth Doula",
          "averageRating": 4.7,
          "totalReviews": 3,
          "births": 0,
          "experience": 6,
          "satisfaction": 93,
          "contact": {
            "email": "doula@test.com",
            "phone": "9000000005",
            "location": "Kochi"
          },
          "about": "Experienced doula",
          "certifications": [
            "Certified"
          ],
          "gallery": []
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Patch('doulas/profile')
  async updateDoulaProfile(
    @Req() req,
    @Body() dto: UpdateDoulaProfileDto,
    @Query('doulaId') doulaId: string) {
    return this.service.updateDoulaProfile(doulaId, dto, req.user.id);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get('recent/activity')
  @ApiOperation({ summary: 'Get recent activity for zone manager' })
  @ApiResponse({
    status: 200,
    description: 'Recent activity fetched successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Recent activity fetched',
        data: [
          {
            id: 'a12b34c5',
            entityType: 'BOOKING',
            entityId: 'a12b34c5',
            action: 'BOOKING_CREATED',
            title: 'New Booking Created',
            description: 'Jane Doe booked Anita Sharma',
            date: '2025-12-31T08:45:21.000Z',
          },
          {
            id: 'm45c98d1',
            entityType: 'MEETING',
            entityId: 'm45c98d1',
            action: 'MEETING_SCHEDULED',
            title: 'Meeting Scheduled',
            description: 'Meeting scheduled with Jane Doe',
            date: '2025-12-31T07:30:00.000Z',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden – not a zone manager' })
  async recentActivity(@Req() req: any) {
    const userId = req.user.id;
    return {
      status: 'success',
      message: 'Recent activity fetched',
      data: await this.service.recentActivityForZoneManager(userId),
    };
  }

}
