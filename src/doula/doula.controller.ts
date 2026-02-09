import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  InternalServerErrorException,
  UploadedFile,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { DoulaService } from './doula.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
import { UpdateDoulaRegionDto } from './dto/update-doula-region.dto';
import { UpdateDoulaStatusDto } from './dto/update-doula-status.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { Role, WeekDays } from '@prisma/client';
import { AddDoulaImageDto } from './dto/add-doula-image.dto';
import { UpdateDoulaProfileDto } from './dto/update-doula.dto';
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';
import { CalculatePricingDto } from './dto/calculate-pricing.dto';
import { S3Service } from 'src/s3/s3.service';
const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const maxSize = 10 * 1024 * 1024; // 50MB per media
const maxSizeGallery = 50 * 1024 * 1024; // 50 MB
function multerMemoryStorage() {
  return memoryStorage();
}

@ApiTags('Doula')
@ApiBearerAuth('bearer')
@Controller({
  path: 'doula',
  version: '1',
})
export class DoulaController {
  constructor(
    private readonly service: DoulaService,
    private readonly s3Service: S3Service
  ) { }


  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Doulas' })
  @ApiBody({ type: CreateDoulaDto }) // <-- REQUIRED
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        "status": "success",
        "message": "Doula created successfully",
        "data": {
          "id": "97879cc9-69e0-4d7a-b982-740ae4e179cb",
          "name": "tomy antony",
          "email": "tomyyt@gmail.com",
          "phone": "+918194740535",
          "otp": null,
          "otpExpiresAt": null,
          "role": "DOULA",
          "is_active": true,
          "createdAt": "2025-12-22T04:32:17.356Z",
          "updatedAt": "2025-12-22T04:32:17.356Z",
          "doulaProfile": {
            "id": "6ad853d5-7588-4ebf-962c-6df1c116c024",
            "userId": "97879cc9-69e0-4d7a-b982-740ae4e179cb",
            "regionId": null,
            "profile_image": "uploads/doulas/1766377937344-760626556.png",
            "description": "Experienced postnatal care doula",
            "achievements": "Handled 200+ successful postnatal cases",
            "qualification": "BSc Nursing",
            "yoe": 4,
            "languages": [
              "English",
              "Malayalam",
              "Hindi"
            ],
            "specialities": [
              "Verified and Certified Professional",
              "Highly rated by past clients",
              "Flexible Scheduling options",
              "Compassionate and personalised care"
            ],
            "createdAt": "2025-12-22T04:32:17.356Z",
            "updatedAt": "2025-12-22T04:32:17.356Z",
            "ServicePricing": [
              {
                "id": "6c1d4738-32ee-4bb6-bebd-8ceb0f8c9c2f",
                "serviceId": "40d19d10-6a90-4323-a083-e1dc20fb4563",
                "price": "1000",
                "service": {
                  "name": "Postnatal Care",
                  "description": "Postnatal care and support"
                }
              },
              {
                "id": "930bc4ea-efdb-4817-9740-6ed5789c91a2",
                "serviceId": "bed0a696-e695-4b6c-bda4-7d9bf11b8898",
                "price": "2000",
                "service": {
                  "name": "Doula Home Visit",
                  "description": "Home care service"
                }
              }
            ],
            "Region": [
              {
                "id": "4c8b7feb-a263-480c-9279-06baecacb0bc",
                "regionName": "Kochi",
                "pincode": "682002",
                "zoneManagerId": "9ec64ea8-4f43-4642-872c-5e8eb5d13de9"
              }
            ],
            "zoneManager": [
              {
                "id": "9ec64ea8-4f43-4642-872c-5e8eb5d13de9",
                "userId": "6b6772d0-b4a5-49e0-bbe5-29767e620ce2",
                "profile_image": "uploads/manager/1766377852442-318850550.png",
                "createdAt": "2025-12-22T04:30:52.493Z",
                "updatedAt": "2025-12-22T04:30:52.493Z"
              }
            ],
            "DoulaGallery": [
              {
                "id": "265113dd-ae8a-4297-959a-b4b56a95dabf",
                "doulaProfileId": "6ad853d5-7588-4ebf-962c-6df1c116c024",
                "url": "uploads/doulas/1766377937340-729624394.png",
                "altText": null,
                "createdAt": "2025-12-22T04:32:17.356Z"
              },
              {
                "id": "6f7e8b5e-9948-4630-aa74-45f43a82d2c6",
                "doulaProfileId": "6ad853d5-7588-4ebf-962c-6df1c116c024",
                "url": "uploads/doulas/1766377937343-471483407.png",
                "altText": null,
                "createdAt": "2025-12-22T04:32:17.356Z"
              },
              {
                "id": "b5b9ed24-80a5-4748-97c8-f62b563481d9",
                "doulaProfileId": "6ad853d5-7588-4ebf-962c-6df1c116c024",
                "url": "uploads/doulas/1766377937342-721963515.png",
                "altText": null,
                "createdAt": "2025-12-22T04:32:17.356Z"
              }
            ],
            "Certificates": [
              {
                "id": "68c8def5-26ac-44d6-a6ec-4998496a9df8",
                "name": "Postpartum Care",
                "issuedBy": "XYZ Org",
                "year": "2023",
                "doulaProfileId": "6ad853d5-7588-4ebf-962c-6df1c116c024"
              },
              {
                "id": "9d23e82e-6c48-4e96-834a-49601c80e4a4",
                "name": "Childbirth Educator",
                "issuedBy": "ABC Institute",
                "year": "2021",
                "doulaProfileId": "6ad853d5-7588-4ebf-962c-6df1c116c024"
              }
            ]
          }
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ZONE_MANAGER')
  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile_image', maxCount: 1 }, // allow multiple images
        { name: 'gallery_image', maxCount: 5 },
      ],
    ),
  )
  async create(
    @Body() dto: CreateDoulaDto,
    @Req() req,
    @UploadedFiles()
    files: {
      profile_image?: Express.Multer.File[];
      gallery_image?: Express.Multer.File[];
    },
  ) {
    const images = files?.gallery_image ?? [];
    const profileImage = files?.profile_image?.[0];

    const totalGallerySize = images.reduce(
      (sum, file) => sum + file.size,
      0,
    );

    if (totalGallerySize > maxSizeGallery) {
      throw new BadRequestException(
        'Total gallery image size must not exceed 50MB',
      );
    }
    let profileImageUrl: string | undefined;
    if (profileImage) {
      // double-check mimetype and size (extra safety)
      if (!allowedImageTypes.includes(profileImage.mimetype)) {
        // remove saved file (optional cleanup) and throw
        throw new BadRequestException('Unsupported image type.');
      }
      if (!this.s3Service.validateFileSize(profileImage, maxSize)) {
        throw new BadRequestException(
          'File is too large (max 10MB)',
        );
      }
      const folder = "uploads/doulas/profile"
      profileImageUrl = await this.s3Service.uploadFile(profileImage, folder);
      console.log("helo exited outside profileimage ")
    }

    let galleryImages: any[] = [];
    if (images) {
      const folder = "uploads/doulas/gallery"
      galleryImages = await this.s3Service.uploadMultipleFiles(images, folder);
    }
    const imagePayload = galleryImages.map((url) => ({ url }));
    const result = await this.service.create(
      dto,
      req.user.id,
      imagePayload,
      profileImageUrl,
    );

    return {
      success: true,
      message: 'Doula created successfully',
      data: result.data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Fetch All Doulas' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, email, phone, region',
  })
  @ApiQuery({ name: 'serviceId', required: false, type: String })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'regionName', required: false, type: String })
  @ApiQuery({
    name: 'minExperience',
    required: false,
    type: Number,
    description: 'Minimum years of experience',
  })
  @ApiQuery({ name: 'serviceName', required: false, type: String })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'ISO date yyyy-MM-dd',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'ISO date yyyy-MM-dd',
  })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Doulas fetched successfully",
        "data": [
          {
            "userId": "d1cbcca2-31e9-4973-a959-c2283c877ab6",
            "isActive": true,
            "name": "Sona",
            "email": "test@test.com",
            "profileId": "fb9a7dab-c41f-46a4-9504-c8e4dbc9018d",
            "yoe": 4,
            "profile_image": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/profile/1768038807938-lbzz4m4pqq8.png",
            "serviceNames": [],
            "regionNames": [
              {
                "id": "63ab0289-43be-4b52-8a9b-c9dd997e34b7",
                "name": "Alaska"
              }
            ],
            "ratings": null,
            "reviewsCount": 0,
            "isAvailable": null,
            "nextImmediateAvailabilityDate": null,
            "images": [
              {
                "id": "2d2410e5-fe46-4fd6-b2ed-11a06e5403b1",
                "url": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/gallery/1768038808428-y77i71lhz9j.png",
                "isPrimary": false
              },
              {
                "id": "571b56b3-35b3-4f09-af05-ed48d59b52ae",
                "url": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/gallery/1768038808428-zxtklll6lo.png",
                "isPrimary": false
              },
              {
                "id": "b3639203-1c65-4272-8232-69bb9b7f2b75",
                "url": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/gallery/1768038808427-vlm1getefa.png",
                "isPrimary": false
              },
              {
                "id": "c909c275-e989-4503-a62e-457586dba314",
                "url": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/gallery/1768038808428-j96mjt21mh.png",
                "isPrimary": false
              }
            ],
            "certificates": []
          }
        ],
        "meta": {
          "total": 8,
          "page": 1,
          "limit": 1,
          "totalPages": 8,
          "hasNextPage": true,
          "hasPrevPage": false
        }
      }
    }
  })
  async get(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('serviceId') serviceId?: string,
    @Query('isAvailable') isAvailable?: boolean,
    @Query('isActive') isActive?: boolean,
    @Query('regionName') regionName?: string,
    @Query('minExperience') minExperience?: number,
    @Query('serviceName') serviceName?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.get(
      Number(page),
      Number(limit),
      search,
      serviceId,
      isAvailable,
      isActive,

      regionName,
      minExperience ? Number(minExperience) : undefined,
      serviceName,
      startDate,
      endDate,
    );
  }

  // GET BY ID
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve Doula using ID' })
  @ApiParam({ name: 'id', required: true, description: 'Doula UUID' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Doula fetched successfully",
        "data": {
          "userId": "d1cbcca2-31e9-4973-a959-c2283c877ab6",
          "name": "Sona",
          "email": "test@test.com",
          "profileId": "fb9a7dab-c41f-46a4-9504-c8e4dbc9018d",
          "yoe": 4,
          "specialities": [
            "Prenatal Care",
            "Postpartum Support"
          ],
          "description": "this is my description",
          "qualification": "plus two",
          "profileImage": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/profile/1768038807938-lbzz4m4pqq8.png",
          "serviceNames": [],
          "regionNames": [
            {
              "id": "63ab0289-43be-4b52-8a9b-c9dd997e34b7",
              "name": "Alaska"
            }
          ],
          "ratings": null,
          "reviewsCount": 0,
          "nextImmediateAvailabilityDate": null,
          "galleryImages": [
            {
              "id": "2d2410e5-fe46-4fd6-b2ed-11a06e5403b1",
              "url": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/gallery/1768038808428-y77i71lhz9j.png",
              "createdAt": "2026-01-10T09:53:28.877Z"
            },
            {
              "id": "571b56b3-35b3-4f09-af05-ed48d59b52ae",
              "url": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/gallery/1768038808428-zxtklll6lo.png",
              "createdAt": "2026-01-10T09:53:28.877Z"
            },
            {
              "id": "b3639203-1c65-4272-8232-69bb9b7f2b75",
              "url": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/gallery/1768038808427-vlm1getefa.png",
              "createdAt": "2026-01-10T09:53:28.877Z"
            },
            {
              "id": "c909c275-e989-4503-a62e-457586dba314",
              "url": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/gallery/1768038808428-j96mjt21mh.png",
              "createdAt": "2026-01-10T09:53:28.877Z"
            }
          ],
          "certificates": [],
          "testimonials": []
        }
      }
    },
  })
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  // DELETE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ZONE_MANAGER')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Doula using ID' })
  @ApiParam({ name: 'id', required: true, description: 'Doula UUID' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Doula deleted successfully",
        "data": {
          "message": "Doula deleted successfully",
          "data": null
        }
      }
    },
  })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // UPDATE STATUS
  @ApiOperation({ summary: "Update Doula's status" })
  @ApiParam({ name: 'id', description: 'Doula ID', required: true })
  @ApiBody({ type: UpdateDoulaStatusDto })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Doula status updated successfully",
        "data": {
          "id": "c9a2b97c-2952-466e-a3c3-ef2d7a429fe8",
          "name": "Doula 1",
          "email": "doula1@example.com",
          "phone": "+919876543111",
          "otp": null,
          "otpExpiresAt": null,
          "role": "DOULA",
          "is_active": true,
          "createdAt": "2025-11-25T14:54:28.899Z",
          "updatedAt": "2025-11-25T15:27:59.960Z"
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ZONE_MANAGER')
  @Patch(':id/update/status/')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateDoulaStatusDto,
  ) {
    return this.service.updateStatus(id, body.isActive);
  }

  // UPDATE DOULA REGIONS
  @ApiOperation({ summary: 'Add or remove regions from a Doula' })
  @ApiBody({
    schema: {
      example: {
        "profileId": "090a1073-a2b6-461f-90de-86d437dd4648",
        "regionIds": [
          "03df8114-cecc-494b-894f-43bd0293e87a"
        ],
        "purpose": "add" //add or remove
      }

    }
  })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Regions added successfully",
        "data": {
          "id": "ba67e5af-01b5-468d-a10a-046937185c7b",
          "userId": "d1bc1741-03d0-4204-9abd-2a043652e495",
          "regionId": null,
          "createdAt": "2025-11-25T15:33:18.922Z",
          "updatedAt": "2025-11-25T15:33:18.922Z",
          "Region": [
            {
              "id": "5578d49b-d2ab-4a28-9e55-e6e2e5b1d2ce",
              "regionName": "North Mumbai",
              "pincode": "4999032",
              "district": "Mumbai Suburban",
              "state": "Maharashtra",
              "country": "India",
              "latitude": "19.1136",
              "longitude": "72.8697",
              "is_active": true,
              "createdAt": "2025-11-25T12:54:48.643Z",
              "updatedAt": "2025-11-25T14:25:31.492Z",
              "zoneManagerId": "173a8866-42da-4500-b20c-c609014d214c"
            },
            {
              "id": "9629c142-e499-4f1c-862b-02ec49975f13",
              "regionName": "North Mumbai",
              "pincode": "4999031",
              "district": "Mumbai Suburban",
              "state": "Maharashtra",
              "country": "India",
              "latitude": "19.1136",
              "longitude": "72.8697",
              "is_active": true,
              "createdAt": "2025-11-25T12:54:45.630Z",
              "updatedAt": "2025-11-25T14:44:33.766Z",
              "zoneManagerId": "173a8866-42da-4500-b20c-c609014d214c"
            },
            {
              "id": "ef23b992-c9e7-4525-9316-a85fc1079b1d",
              "regionName": "North Mumbai",
              "pincode": "4999035",
              "district": "Mumbai Suburban",
              "state": "Maharashtra",
              "country": "India",
              "latitude": "19.1136",
              "longitude": "72.8697",
              "is_active": true,
              "createdAt": "2025-11-25T13:18:08.441Z",
              "updatedAt": "2025-11-25T14:25:31.492Z",
              "zoneManagerId": "173a8866-42da-4500-b20c-c609014d214c"
            }
          ],
          "zoneManager": [
            {
              "id": "173a8866-42da-4500-b20c-c609014d214c",
              "userId": "9f9bc3d6-05fc-4f1f-b5b3-d9a07117bff7",
              "createdAt": "2025-11-25T14:25:31.492Z",
              "updatedAt": "2025-11-25T14:25:31.492Z"
            }
          ]
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ZONE_MANAGER')
  @Patch('update/regions')
  async updateRegions(@Body() dto: UpdateDoulaRegionDto, @Req() req) {
    return this.service.UpdateDoulaRegions(dto, req.user.id);
  }

  //useless api
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/meetings')
  async getDoulaMeetings(
    @Req() req,
    @Query('date') date?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.getDoulaMeetings(
      req.user,
      Number(page),
      Number(limit),
      date,
    );
  }
  //useless api
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/meetings/:meetingId')
  async getDoulaMeetingDetail(
    @Req() req,
    @Param('meetingId') meetingId: string,
  ) {
    return this.service.getDoulaMeetingDetail(req.user, meetingId);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/schedules')
  @ApiOperation({ summary: 'Get schedules of logged-in doula' })
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2025-01-20',
    description: 'Fetch schedules on a specific date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        "status": "success",
        "message": "Doula schedules fetched successfully",
        "data": [
          {
            "scheduleId": "175869e5-3531-4fc9-a8da-d44ab6049789",
            "TimeShift": "FULLDAY",
            "date": "2027-01-30T00:00:00.000Z",
            "timeshift": "FULLDAY",
            "serviceName": "Post Partum Doula",
            "clientName": "Jane Doe",
            "status": "PENDING"
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
    },
  })
  async getDoulaSchedules(
    @Req() req,
    @Query('date') date?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.getDoulaSchedules(
      req.user,
      Number(page),
      Number(limit),
      date,
    );
  }




  @ApiOperation({ description: "Retrieve each Schedules using uuid" })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: "scheduleId", description: "uuid of Meeting Instance" })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Doula schedule fetched successfully",
        "data": {
          "scheduleId": "175869e5-3531-4fc9-a8da-d44ab6049789",
          "date": "2027-01-30T00:00:00.000Z",
          "timeshift": "FULLDAY",
          "status": "PENDING",
          "service": {
            "servicePricingId": "6bf04639-948b-4302-ae6b-8ae5cf70033a",
            "serviceId": "41bb32e6-ae80-4a9c-8cd9-855f98ced1b2",
            "serviceName": "Post Partum Doula",
            "price": {
              "night": 3000,
              "fullday": 5000,
              "morning": 2000
            }
          },
          "client": {
            "clientId": "8411173d-0d5b-4b02-8e8c-2812c109d102",
            "name": "Jane Doe",
            "email": "nandhudevanand4419@gmail.com",
            "phone": "9876543230"
          }
        }
      }
    }
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/schedules/:scheduleId')
  async getDoulaScheduleDetail(
    @Req() req,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.service.getDoulaScheduleDetail(req.user, scheduleId);
  }


  @ApiOperation({ summary: 'Get today and weekly schedule count for doula' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        "status": "success",
        "message": "Doula schedule counts fetched successfully",
        "data": {
          "today": 0,
          "thisWeek": 0
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/schedules/count')
  async getDoulaScheduleCount(@Req() req) {
    return this.service.getDoulaScheduleCount(req.user);
  }

  //useless api
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/meetings/immediate')
  async getImmediateMeeting(@Req() req) {
    return this.service.ImmediateMeeting(req.user);
  }


  @ApiOperation({ summary: 'Get doula rating summary' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        "status": "success",
        "message": "Doula rating summary fetched successfully",
        "data": {
          "averageRating": 4.7,
          "totalReviews": 3,
          "distribution": {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 1,
            "5": 2
          }
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/ratings/summary')
  async getRatingSummary(@Req() req) {
    return this.service.getDoulaRatingSummary(req.user);
  }


  @ApiOperation({
    summary: 'Fetch testimonials associated with the Doula',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        "status": "success",
        "message": "Doula testimonials fetched successfully",
        "data": [
          {
            "clientId": "6aa686a9-9b1e-47d4-af52-cfd329239ebb",
            "clientName": "John Doeyy",
            "email": "john1233@example.com",
            "phone": "9836540222",
            "ratings": 5,
            "reviews": "Highly recommend this doula.",
            "createdAt": "2025-12-19T11:02:01.834Z",
            "serviceName": "Postnatal Care",
            "servicePricingId": "5af77fea-6805-4780-9fc3-db8ad9b0b887"
          },
          {
            "clientId": "6aa686a9-9b1e-47d4-af52-cfd329239ebb",
            "clientName": "John Doeyy",
            "email": "john1233@example.com",
            "phone": "9836540222",
            "ratings": 5,
            "reviews": "Excellent care and very supportive.",
            "createdAt": "2025-12-19T11:02:01.834Z",
            "serviceName": "Postnatal Care",
            "servicePricingId": "5af77fea-6805-4780-9fc3-db8ad9b0b887"
          },
          {
            "clientId": "6aa686a9-9b1e-47d4-af52-cfd329239ebb",
            "clientName": "John Doeyy",
            "email": "john1233@example.com",
            "phone": "9836540222",
            "ratings": 4,
            "reviews": "Very professional and kind.",
            "createdAt": "2025-12-19T11:02:01.834Z",
            "serviceName": "Postnatal Care",
            "servicePricingId": "5af77fea-6805-4780-9fc3-db8ad9b0b887"
          }
        ],
        "meta": {
          "total": 3,
          "page": 1,
          "limit": 10,
          "totalPages": 1,
          "hasNextPage": false,
          "hasPrevPage": false
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/testimonials')
  async getDoulaTestimonials(
    @Req() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.getDoulaTestimonials(
      req.user,
      Number(page),
      Number(limit),
    );
  }


  @ApiOperation({
    summary: "Fetch Doula's Profile"
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        "status": "success",
        "message": "Doula profile fetched successfully",
        "data": {
          "id": "c47f4da8-c249-403f-9e27-f0452dec9a41",
          "userId": "a6a18005-37d9-4df3-89db-32ecc443f1b9",
          "name": "Andy gullit",
          "title": "Certified Birth Doula",
          "averageRating": 0,
          "totalReviews": 0,
          "births": 0,
          "experience": 4,
          "satisfaction": 0,
          "qualification": "plus two",
          "contact": {
            "email": "parasyadigitalhub@gmail.com",
            "phone": "2348735882",
            "location": "California"
          },
          "about": "this is my description",
          "servicePricing": [
            {
              "servicePricingid": "6bf04639-948b-4302-ae6b-8ae5cf70033a",
              "servicename": "Post Partum Doula",
              "price": {
                "night": 3000,
                "fullday": 5000,
                "morning": 2000
              }
            },
            {
              "servicePricingid": "a06e7596-b571-4b20-ae57-0df58983f159",
              "servicename": "Birth Doula",
              "price": {
                "night": 0,
                "fullday": 30,
                "morning": 0
              }
            }
          ],
          "certificates": [],
          "gallery": []
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/profile')
  async getDoulaProfile(@Req() req) {
    return this.service.doulaProfile(req.user);
  }






  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA, Role.ZONE_MANAGER)
  @Post('profile/images')
  @ApiOperation({ summary: 'Upload doula profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profile_image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['profile_image'],
    },
  })
  @ApiResponse({
    status: 201, description: 'Profile image uploaded successfully', schema: {
      example: {
        "status": "success",
        "message": "Image uploaded successfully",
        "data": {
          "id": "c47f4da8-c249-403f-9e27-f0452dec9a41",
          "userId": "a6a18005-37d9-4df3-89db-32ecc443f1b9",
          "regionId": null,
          "profile_image": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/profile/1768039613243-yuptsc58q2.png",
          "description": "this is my description",
          "achievements": "nil",
          "qualification": "plus two",
          "yoe": 4,
          "languages": [
            "Hindi",
            "English"
          ],
          "specialities": [
            "Prenatal Care",
            "Postpartum Support"
          ],
          "createdAt": "2026-01-07T04:46:13.668Z",
          "updatedAt": "2026-01-10T10:06:53.792Z"
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file missing' })
  @UseInterceptors(
    FileInterceptor('profile_image'),
  )
  @ApiConsumes('multipart/form-data')
  async uploadDoulaImage(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Query('doulaId') doulaId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Profile image is required');
    }
    const allowedImageTypes = [
      'image/jpeg',
      'image/png'
    ];
    const maxSize = 10 * 1024 * 1024; // 50MB per media

    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException(
        'File is too large (max 10MB)',
      );
    }
    const folder = "uploads/doulas/profile"
    const profileImageUrl = await this.s3Service.uploadFile(file, folder);
    return this.service.addDoulaprofileImage(
      req.user.id,
      profileImageUrl,
      doulaId,
    );
  }



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA, Role.ZONE_MANAGER)
  @Get('profile/images')
  @ApiOperation({ summary: 'Get doula profile image' })
  @ApiResponse({
    status: 200, description: 'Profile image fetched successfully', schema: {
      example: {
        "status": "success",
        "message": "Doula Profile Image fetched successfully",
        "data": {
          "id": "c47f4da8-c249-403f-9e27-f0452dec9a41",
          "profile_image": "https://dev-palqar-bucket.s3.ap-south-1.amazonaws.com/uploads/doulas/profile/1768039690174-66o0hnaqe73.png"
        }
      }
    }
  })
  async getDoulaImages(
    @Req() req,
    @Query('doulaId') doulaId?: string,) {
    return this.service.getDoulaImages(req.user.id, doulaId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA, Role.ZONE_MANAGER)
  @Delete('profile/images/')
  @ApiOperation({ summary: 'Delete doula profile image' })
  @ApiResponse({
    status: 200, description: 'Profile image deleted successfully', schema: {
      example: {
        "status": "success",
        "message": "Image deleted successfully",
        "data": {
          "message": "Image deleted successfully"
        }
      }
    }
  })
  async deleteDoulaImage(
    @Req() req,
    @Query('doulaId') doulaId?: string,) {
    return this.service.deleteDoulaprofileImage(
      req.user.id,
      doulaId,
    );
  }



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Post('gallery/images')
  @ApiOperation({ summary: 'Upload doula gallery images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      example: {
        "files": [/* array of image files */],
      }
    },
  })
  @ApiResponse({
    status: 201, description: 'Gallery images uploaded successfully', schema: {
      example: {
        "status": "success",
        "message": "Gallery images uploaded successfully",
        "data": [
          {
            "id": "1cf75998-f21e-4560-b26c-c66f5bc653e2",
            "url": "uploads/doulas/1766323074032-45676702.png",
            "altText": null,
            "createdAt": "2025-12-21T13:17:54.036Z"
          },
          {
            "id": "26ecf01a-2fe8-488e-a1c5-704be3e34f76",
            "url": "uploads/doulas/1766323074031-151303295.png",
            "altText": null,
            "createdAt": "2025-12-21T13:17:54.036Z"
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Total gallery size exceeded' })
  @UseInterceptors(
    FilesInterceptor('files', 10),
  )
  async addGalleryImages(
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('altText') altText?: string,
  ) {

    const totalGallerySize = files.reduce(
      (sum, file) => sum + file.size,
      0,
    );

    if (totalGallerySize > maxSizeGallery) {
      throw new BadRequestException(
        'Total gallery image size must not exceed 50MB',
      );
    }
    let galleryImages: any[] = [];
    if (files) {
      const folder = "uploads/doulas/gallery"
      galleryImages = await this.s3Service.uploadMultipleFiles(files, folder);
    }
    const imagePayload = galleryImages.map((url) => ({ url }));
    return this.service.addDoulaGalleryImages(req.user.id, imagePayload, altText);
  }

  // =========================
  // GET GALLERY IMAGES
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('gallery/images/')
  @ApiOperation({ summary: 'Get doula gallery images' })
  @ApiResponse({
    status: 200, description: 'Gallery images fetched successfully', schema: {
      example: {
        "status": "success",
        "message": "Gallery images uploaded successfully",
        "data": [
          {
            "id": "1cf75998-f21e-4560-b26c-c66f5bc653e2",
            "url": "uploads/doulas/1766323074032-45676702.png",
            "altText": null,
            "createdAt": "2025-12-21T13:17:54.036Z"
          },
          {
            "id": "26ecf01a-2fe8-488e-a1c5-704be3e34f76",
            "url": "uploads/doulas/1766323074031-151303295.png",
            "altText": null,
            "createdAt": "2025-12-21T13:17:54.036Z"
          }
        ]
      }
    }
  })
  async getGalleryImages(@Req() req) {
    return this.service.getDoulaGalleryImages(req.user.id);
  }

  // =========================
  // DELETE GALLERY IMAGE
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Delete('gallery/images/:id')
  @ApiOperation({ summary: 'Delete doula gallery image' })
  @ApiParam({
    name: 'id',
    description: 'Gallery image ID',
  })
  @ApiResponse({ status: 200, description: 'Gallery image deleted successfully' })
  async deleteGalleryImage(@Req() req, @Param('id') imageId: string) {
    return this.service.deleteDoulaGalleryImage(req.user.id, imageId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Patch('app/profile')
  @ApiOperation({ summary: 'Update doula profile' })
  @ApiResponse({
    status: 200, description: 'Profile updated successfully', schema: {
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
  async updateDoulaProfile(@Req() req, @Body() dto: UpdateDoulaProfileDto) {
    return this.service.updateDoulaProfile(req.user.id, dto);
  }

  // UPDATE certificate
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Post('add/certificates/')
  @ApiOperation({ summary: 'Add certificate to doula profile' })
  @ApiResponse({
    status: 201, description: 'Certificate added successfully', schema: {
      example: {
        "status": "success",
        "message": "Certificate Added Succesfully",
        "data": {
          "id": "59b791fa-6e71-477f-89cc-624c5baf9ed8",
          "name": "Childbirth Educator",
          "issuedBy": "ABC Institute",
          "year": "2021",
          "doulaProfileId": "c6b0d1dc-be83-42f6-bba1-4a709ec889e6"
        }
      }
    }
  })
  async addCertificate(
    @Req() req,
    @Body() dto: CreateCertificateDto,
  ) {
    return this.service.addCertificate(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('list/certificates')
  @ApiOperation({ summary: 'Get all certificates of doula' })
  @ApiResponse({
    status: 200, description: 'Certificates fetched successfully', schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": [
          {
            "id": "73e17db8-75ea-408c-89ee-d7041b07a992",
            "name": "Postpartum Care",
            "issuedBy": "XYZ Org",
            "year": "2023",
            "doulaProfileId": "8390b32d-39ac-40c5-abca-45fbeb08e4b0"
          },
          {
            "id": "c3b532fb-3eba-41c8-a683-87c5574224bb",
            "name": "Childbirth Educator",
            "issuedBy": "ABC Institute",
            "year": "2021",
            "doulaProfileId": "8390b32d-39ac-40c5-abca-45fbeb08e4b0"
          }
        ]
      }
    }
  })
  async getCertificates(@Req() req) {
    return this.service.getCertificates(req.user.id);
  }

  // GET certificate by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('list/certificates/:id')
  @ApiOperation({ summary: 'Get certificate by ID' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiResponse({
    status: 200, description: 'Certificates fetched successfully', schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "id": "73e17db8-75ea-408c-89ee-d7041b07a992",
          "name": "Postpartum Care",
          "issuedBy": "XYZ Org",
          "year": "2023",
          "doulaProfileId": "8390b32d-39ac-40c5-abca-45fbeb08e4b0"
        }
      }
    }
  })
  async getCertificateById(@Req() req, @Param('id') certificateId: string) {
    return this.service.getCertificateById(req.user.id, certificateId);
  }

  // UPDATE certificate
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Patch('list/certificates/:id')
  @ApiOperation({ summary: 'Update certificate' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiResponse({
    status: 200, description: 'Certificates udpated successfully', schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "id": "73e17db8-75ea-408c-89ee-d7041b07a992",
          "name": "Postpartum Care",
          "issuedBy": "XYZ Org",
          "year": "2023",
          "doulaProfileId": "8390b32d-39ac-40c5-abca-45fbeb08e4b0"
        }
      }
    }
  })
  async updateCertificate(
    @Req() req,
    @Param('id') certificateId: string,
    @Body() dto: UpdateCertificateDto,
  ) {
    return this.service.updateCertificate(req.user.id, certificateId, dto);
  }

  // DELETE certificate
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Delete('list/certificates/:id')
  @ApiOperation({ summary: 'Delete certificate' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiResponse({
    status: 200, description: 'Certificates udpated successfully', schema: {
      example: {
        "status": "success",
        "message": "Certificate deleted successfully",
        "data": {
          "message": "Certificate deleted successfully"
        }
      }
    }
  })
  async deleteCertificate(@Req() req, @Param('id') certificateId: string) {
    return this.service.deleteCertificate(req.user.id, certificateId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/service-bookings')
  @ApiOperation({ summary: 'Get booked services of logged-in doula' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'date',
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'limit',
    type: Number,
  })
  @ApiResponse({
    status: 200, description: 'Certificates udpated successfully', schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": [
          {
            "serviceBookingId": "b44b0317-869f-4506-8393-6729364237fd",
            "startDate": "2027-01-27T00:00:00.000Z",
            "endDate": "2027-01-30T00:00:00.000Z",
            "timeShift": "FULLDAY",
            "status": "ACTIVE",
            "totalAmount": "10",
            "client": {
              "name": "Jane Doe",
              "email": "nandhudevanand4419@gmail.com",
              "phone": "9876543230"
            },
            "region": {
              "id": "35124707-c367-4148-8ac7-ff080f93ab82",
              "name": "California"
            },
            "service": {
              "servicePricingId": "6bf04639-948b-4302-ae6b-8ae5cf70033a",
              "serviceId": "41bb32e6-ae80-4a9c-8cd9-855f98ced1b2",
              "serviceName": "Post Partum Doula",
              "pricePerVisit": {
                "night": 3000,
                "fullday": 5000,
                "morning": 2000
              }
            },
            "schedulesCount": 2,
            "totalPrice": "10"
          }
        ],
        "meta": {
          "total": 46,
          "page": 1,
          "limit": 1,
          "totalPages": 46,
          "hasNextPage": true,
          "hasPrevPage": false
        }
      }
    }
  })
  async getServiceBookings(
    @Req() req,
    @Query('date') date?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.getServiceBookings(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)

  @ApiResponse({
    status: 200, description: 'Certificates udpated successfully', schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "serviceBookingId": "b44b0317-869f-4506-8393-6729364237fd",
          "startDate": "2027-01-27T00:00:00.000Z",
          "endDate": "2027-01-30T00:00:00.000Z",
          "timeShift": "FULLDAY",
          "status": "ACTIVE",
          "isPaid": true,
          "client": {
            "id": "08eb5dfb-d9cd-412f-b6eb-a25e4509edc4",
            "name": "Jane Doe",
            "email": "nandhudevanand4419@gmail.com",
            "phone": "9876543230",
            "address": "Street 12, Kochi, Kerala"
          },
          "region": {
            "id": "35124707-c367-4148-8ac7-ff080f93ab82",
            "name": "California",
            "zoneManager": {
              "id": "a0c3a440-197d-459d-8d3f-315564bd704d",
              "name": "Manager Ohio",
              "email": "touchmagnolia@gmail.com"
            }
          },
          "service": {
            "servicePricingId": "6bf04639-948b-4302-ae6b-8ae5cf70033a",
            "serviceId": "41bb32e6-ae80-4a9c-8cd9-855f98ced1b2",
            "serviceName": "Post Partum Doula",
            "pricePerVisit": {
              "night": 3000,
              "fullday": 5000,
              "morning": 2000
            },
            "totalVisits": 2,
            "totalPrice": "10"
          },
          "schedules": [
            {
              "id": "1487b782-668d-4bd8-aa35-01c2fc4dc389",
              "date": "2027-01-27T00:00:00.000Z",
              "timeShift": "FULLDAY",
              "status": "PENDING"
            },
            {
              "id": "175869e5-3531-4fc9-a8da-d44ab6049789",
              "date": "2027-01-30T00:00:00.000Z",
              "timeShift": "FULLDAY",
              "status": "PENDING"
            }
          ]
        }
      }
    }
  })
  @Get('app/service-bookings/:id')
  @ApiOperation({ summary: 'Get booked services of logged-in doula' })
  async getServiceBookingsinDetail(
    @Req() req,
    @Param('id') serviceBookingId: string,
  ) {
    console.log(serviceBookingId);
    return this.service.getServiceBookingsInDetail(
      req.user.id,
      serviceBookingId,
    );
  }


  @Get(':id/available-shifts')
  @ApiOperation({
    summary: 'Get available shifts for a doula',
    description:
      'Returns availability status for morning, night, and fullday shifts based on visit dates calculated from start date, end date, and visit frequency',
  })
  @ApiParam({ name: 'id', description: 'Doula Profile ID' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    example: '2025-01-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    example: '2025-01-31',
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'visitFrequency',
    required: true,
    type: Number,
    example: 7,
    description: 'Number of days between each visit',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        success: true,
        message: 'Available shifts fetched successfully',
        data: {
          doulaId: 'doula-uuid',
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          visitFrequency: 7,
          visitDates: [
            '2025-01-01',
            '2025-01-08',
            '2025-01-15',
            '2025-01-22',
            '2025-01-29',
          ],
          availability: {
            MORNING: true,
            NIGHT: false,
            FULLDAY: false,
          },
        },
      },
    },
  })
  async getAvailableShifts(
    @Param('id') doulaId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('visitDays') visitDays: WeekDays[],
  ) {
    return this.service.getAvailableShifts(
      doulaId,
      startDate,
      endDate,
      visitDays,
    );
  }


  @Get('doula/:doulaId/shifts')
  @ApiOperation({
    summary: 'Get all shifts for a specific doula',
    description: 'Returns all scheduled shifts for the given doula',
  })
  @ApiParam({ name: 'doulaId', description: 'Doula Profile ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        success: true,
        message: 'Shifts fetched successfully',
        data: [
          {
            shiftId: 'shift-uuid',
            date: '2025-01-15',
            timeshift: 'MORNING',
            status: 'SCHEDULED',
            serviceName: 'Postnatal Care',
            clientName: 'Jane Doe',
          },
        ],
        meta: {
          total: 10,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  async getShiftsByDoula(
    @Param('doulaId') doulaId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.getShiftsByDoula(
      doulaId,
      Number(page),
      Number(limit),
    );
  }

  @Get('shifts/:shiftId')
  @ApiOperation({
    summary: 'Get shift details by ID',
    description: 'Returns detailed information about a specific shift',
  })
  @ApiParam({ name: 'shiftId', description: 'Shift ID' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        success: true,
        message: 'Shift details fetched successfully',
        data: {
          shiftId: 'shift-uuid',
          date: '2025-01-15',
          timeshift: 'MORNING',
          status: 'SCHEDULED',
          doula: {
            doulaId: 'doula-uuid',
            name: 'Sarah Johnson',
          },
          client: {
            clientId: 'client-uuid',
            name: 'Jane Doe',
            email: 'jane@example.com',
          },
          service: {
            servicePricingId: 'pricing-uuid',
            serviceName: 'Postnatal Care',
            price: 150,
          },
        },
      },
    },
  })
  async getShiftById(@Param('shiftId') shiftId: string) {
    return this.service.getShiftById(shiftId);
  }

  @Post('calculate/pricing')
  @ApiOperation({
    summary: 'Calculate pricing for doula service',
    description:
      'Calculates the total price for a doula service based on service type, dates, and availability. Returns pricing if doula is available, otherwise returns unavailable dates.',
  })
  @ApiBody({ type: CalculatePricingDto })
  @ApiResponse({
    status: 200,
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: {
              type: 'string',
              example: 'Pricing calculated successfully',
            },
            data: {
              type: 'object',
              properties: {
                available: { type: 'boolean', example: true },
                doulaProfileId: {
                  type: 'string',
                  example: '7de77403-ca72-452b-abfa-296c26df8116',
                },
                servicePricingId: {
                  type: 'string',
                  example: '00880c8d-abbc-42df-b6d7-c24ab4044ed0',
                },
                serviceName: { type: 'string', example: 'Post Partum Doula' },
                startDate: { type: 'string', example: '2025-01-01' },
                endDate: { type: 'string', example: '2025-01-31' },
                visitDates: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['2025-01-01', '2025-01-08', '2025-01-15'],
                },
                numberOfVisits: { type: 'number', example: 5 },
                timeShift: { type: 'string', example: 'MORNING' },
                pricePerVisit: { type: 'number', example: 10 },
                totalAmount: { type: 'number', example: 50 },
                currency: { type: 'string', example: 'INR' },
                priceBreakdown: {
                  type: 'object',
                  example: { morning: 10, night: 20, fullday: 30 },
                },
              },
            },
          },
        },
        {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: {
              type: 'string',
              example: 'Doula is not available for selected dates',
            },
            data: {
              type: 'object',
              properties: {
                available: { type: 'boolean', example: false },
                unavailableDates: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['2025-01-08', '2025-01-15'],
                },
                reason: {
                  type: 'string',
                  example: 'Doula is not available on 2 date(s)',
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid parameters or validation errors',
  })
  @ApiResponse({
    status: 404,
    description: 'Doula profile or service pricing not found',
  })
  async calculatePricing(@Body() dto: CalculatePricingDto) {
    return this.service.calculatePricing(dto);
  }



  //--------------------------------------------------------------
  // Update 1
  //--------------------------------------------------------------

  @Get(':doulaId/booked-dates')
  @ApiOperation({
    summary: 'Get booked dates for a doula within a date range',
  })
  @ApiParam({
    name: 'doulaId',
    type: String,
    description: 'Doula ID',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    example: '2026-02-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    example: '2026-02-10',
    description: 'End date (YYYY-MM-DD)',
  })
  async getBookedDates(
    @Param('doulaId') doulaId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'startDate and endDate are required',
      );
    }

    return this.service.getBookedDatesInRange(
      doulaId,
      startDate,
      endDate,
    );
  }
}
