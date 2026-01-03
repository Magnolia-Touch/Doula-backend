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
import { Role } from '@prisma/client';
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
            "userId": "a0f185ed-8c28-4316-ac07-dbdc7dce8f38",
            "isActive": true,
            "name": "Reena Smith",
            "email": "doula@test.com",
            "profileId": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
            "yoe": 6,
            "profile_image": "uploads/doulas/1767154501903-168020899.png",
            "serviceNames": [
              {
                "servicePricingId": "0b4a9cc8-3ce5-4039-858d-9b60cb8b381f",
                "serviceId": "26c11b42-417c-4e37-8543-4ef609646718",
                "serviceName": "Birth Doula",
                "price": {
                  "night": 12,
                  "fullday": 12,
                  "morning": 12
                }
              },
              {
                "servicePricingId": "0cee20c7-14e5-498f-ab73-a5b8e38cac02",
                "serviceId": "41bb32e6-ae80-4a9c-8cd9-855f98ced1b2",
                "serviceName": "Post Partum Doula",
                "price": {
                  "night": 1900,
                  "fullday": 1900,
                  "morning": 1900
                }
              },
              {
                "servicePricingId": "4924b14a-5b80-46f9-bb7e-29e89ed7c55b",
                "serviceId": "41bb32e6-ae80-4a9c-8cd9-855f98ced1b2",
                "serviceName": "Post Partum Doula",
                "price": {
                  "night": 5,
                  "fullday": 5,
                  "morning": 5
                }
              },
              {
                "servicePricingId": "5ef3ddd2-e058-4d9c-b7cb-288e0baaa14a",
                "serviceId": "41bb32e6-ae80-4a9c-8cd9-855f98ced1b2",
                "serviceName": "Post Partum Doula",
                "price": {
                  "night": 15,
                  "fullday": 15,
                  "morning": 15
                }
              },
              {
                "servicePricingId": "a7e7ebcc-8855-4c08-b6c1-76132ba676a6",
                "serviceId": "41bb32e6-ae80-4a9c-8cd9-855f98ced1b2",
                "serviceName": "Post Partum Doula",
                "price": {
                  "night": 10,
                  "fullday": 10,
                  "morning": 1000
                }
              },
              {
                "servicePricingId": "c671c36c-5ec4-4f8a-ba49-74ff6e5dc415",
                "serviceId": "41bb32e6-ae80-4a9c-8cd9-855f98ced1b2",
                "serviceName": "Post Partum Doula",
                "price": {
                  "night": 56,
                  "fullday": 56,
                  "morning": 56
                }
              },
              {
                "servicePricingId": "f00e2a99-b097-4c3c-9783-75d5d09ba497",
                "serviceId": "26c11b42-417c-4e37-8543-4ef609646718",
                "serviceName": "Birth Doula",
                "price": {
                  "night": 1,
                  "fullday": 100,
                  "morning": 1
                }
              }
            ],
            "regionNames": [
              {
                "id": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
                "name": "North Mumbai"
              }
            ],
            "ratings": 4.666666666666667,
            "reviewsCount": 3,
            "isAvailable": null,
            "nextImmediateAvailabilityDate": "2042-10-29T00:00:00.000Z",
            "images": [
              {
                "id": "57c4ba33-5029-4123-8051-ddfa6aad2b06",
                "url": "uploads/doulas/1767165269144-747759397.jpeg",
                "isPrimary": false
              },
              {
                "id": "97c0e4c8-54c5-4f72-8120-86803a4a9592",
                "url": "uploads/doulas/1767154479164-287555438.png",
                "isPrimary": false
              }
            ],
            "certificates": [
              {
                "id": "1d87d45c-9730-423e-8fff-0b7ba21d95db",
                "name": "Advanceda Birth Support",
                "issuedBy": "WHO",
                "year": "2022"
              },
              {
                "id": "d9907ca6-01fd-47e3-af61-65d555028982",
                "name": "Childbirth Educator",
                "issuedBy": "ABC Institute",
                "year": "2021"
              }
            ]
          }
        ],
        "meta": {
          "total": 1,
          "page": 1,
          "limit": 100,
          "totalPages": 1,
          "hasNextPage": false,
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
          "userId": "305cd275-b043-4533-bf37-c2903c314e84",
          "name": "manju warrie",
          "email": "manju@gmail.com",
          "profileId": "d79fee60-f541-4de3-aa29-09486867308c",
          "yoe": 4,
          "specialities": [
            "Verified and Certified Professional",
            "Highly rated by past clients",
            "Flexible Scheduling options",
            "Compassionate and personalised care"
          ],
          "description": "Experienced postnatal care doula",
          "qualification": "BSc Nursing",
          "profileImage": "uploads/doulas/1766571959818-993549016.png",
          "serviceNames": [
            {
              "servicePricingId": "485ca59d-4442-4ac7-bf72-ec55ab08e884",
              "serviceId": "9bb22e28-994a-4451-af86-785deb6da2f0",
              "serviceName": "Postnatal Care",
              "price": {
                "night": 1030,
                "fullday": 1030,
                "morning": 1030
              }
            }
          ],
          "regionNames": [
            {
              "id": "03df8114-cecc-494b-894f-43bd0293e87a",
              "name": "Kochi"
            }
          ],
          "ratings": 4,
          "reviewsCount": 1,
          "nextImmediateAvailabilityDate": null,
          "galleryImages": [
            {
              "id": "27a1b271-2292-40d5-923f-a2f74d7f1566",
              "url": "uploads/doulas/1766571959814-977031325.png",
              "createdAt": "2025-12-24T10:25:59.824Z"
            },
            {
              "id": "a4f3e4c9-a5b6-4af6-b9c1-829e11bd7958",
              "url": "uploads/doulas/1766571959816-234739904.png",
              "createdAt": "2025-12-24T10:25:59.824Z"
            },
            {
              "id": "e60d0c47-c96d-4b6f-a3a3-750829f55ea2",
              "url": "uploads/doulas/1766571959812-808086411.png",
              "createdAt": "2025-12-24T10:25:59.824Z"
            }
          ],
          "certificates": [
            {
              "id": "55d13dc1-d810-4c56-8f3b-92006a584cf1",
              "name": "Postpartum Care",
              "issuedBy": "XYZ Org",
              "year": "2023"
            },
            {
              "id": "78a677de-eec7-49f9-a068-5dac65569a0c",
              "name": "Childbirth Educator",
              "issuedBy": "ABC Institute",
              "year": "2021"
            }
          ],
          "testimonials": [
            {
              "id": "8425771a-06a9-415f-ad4e-8df79840d2fb",
              "rating": 4,
              "review": "Excellent service by manju warrie. Highly recommended.",
              "clientName": "Suni",
              "clientId": "6f2da163-44d1-4f6f-a5b2-8b946c664569",
              "serviceId": "485ca59d-4442-4ac7-bf72-ec55ab08e884",
              "createdAt": "2025-12-24T10:26:08.514Z"
            }
          ]
        }
      },
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
      },
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

  // UPDATE DOULA REGIONS
  @ApiOperation({ summary: 'Fetch All Meetings of Doula' })
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'date', required: false, example: '2025-01-20' })
  @ApiQuery({ name: 'page', example: 1 })
  @ApiQuery({ name: 'limit', example: 10 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        "status": "success",
        "message": "Doula meetings fetched successfully",
        "data": [
          {
            "meetingId": "2be347b8-2577-4be5-99a0-90b064d25bf2",
            "date": "2025-12-23T00:00:00.000Z",
            "serviceName": "Postnatal Care",
            "clientName": "Test Client"
          },
          {
            "meetingId": "93ee18dd-d9c7-4af0-bf29-f26ecf7419ac",
            "date": "2025-12-20T00:00:00.000Z",
            "serviceName": "Postnatal Care",
            "clientName": "Test Client"
          },
          {
            "meetingId": "16233725-e8b2-4e69-a743-48ff4cf78a5b",
            "date": "2025-12-01T00:00:00.000Z",
            "serviceName": "Doula Consultation",
            "clientName": "Client User"
          },
          {
            "meetingId": "a05d0aa2-6cee-4d2e-83f5-69fd87006a1e",
            "date": "2025-12-01T00:00:00.000Z",
            "serviceName": "Doula Consultation",
            "clientName": "Client User"
          },
          {
            "meetingId": "48b6dd6d-4581-44bd-98e0-cca4bb36c370",
            "date": "2025-11-30T00:00:00.000Z",
            "serviceName": "Doula Consultation",
            "clientName": "Client User"
          },
          {
            "meetingId": "5e5dc703-68ad-4094-9146-1158f3e6f9f0",
            "date": "2025-11-30T00:00:00.000Z",
            "serviceName": "Doula Consultation",
            "clientName": "Client User"
          }
        ],
        "meta": {
          "total": 6,
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



  @ApiOperation({ description: "Retrieve each Meetings using uuid" })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: "meetingId", description: "uuid of Meeting Instance" })
  @ApiResponse({
    schema: {
      example: {
        "status": "success",
        "message": "Doula meeting fetched successfully",
        "data": {
          "meetingId": "2be347b8-2577-4be5-99a0-90b064d25bf2",
          "date": "2025-12-23T00:00:00.000Z",
          "startTime": "1970-01-01T10:00:00.000Z",
          "endTime": "1970-01-01T11:00:00.000Z",
          "status": "SCHEDULED",
          "serviceName": "Postnatal Care",
          "client": {
            "clientId": "05390b91-e02f-4ea6-b9db-35286d95b3d6",
            "name": "Test Client",
            "email": "clienttt@test.com"
          }
        }
      }
    }
  })
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
            "scheduleId": "d55172fa-1464-46d0-83cd-052ef59c84f9",
            "date": "2025-12-24T00:00:00.000Z",
            "startTime": "1970-01-01T09:00:00.000Z",
            "endTime": "1970-01-01T10:00:00.000Z",
            "serviceName": "Postnatal Care",
            "clientName": "Test Client"
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
          "scheduleId": "d55172fa-1464-46d0-83cd-052ef59c84f9",
          "date": "2025-12-24T00:00:00.000Z",
          "startTime": "1970-01-01T09:00:00.000Z",
          "endTime": "1970-01-01T10:00:00.000Z",
          "status": "PENDING",
          "service": {
            "servicePricingId": "0f84c81e-dfbe-46f9-9e87-997750a1b135",
            "serviceId": "a8837615-78d9-40a0-a801-4ba7b322b7a6",
            "serviceName": "Postnatal Care",
            "price": "1800"
          },
          "client": {
            "clientId": "05390b91-e02f-4ea6-b9db-35286d95b3d6",
            "name": "Test Client",
            "email": "clienttt@test.com"
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


  @ApiOperation({ summary: 'Get next immediate meeting for doula dashboard' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        "status": "success",
        "message": "Immediate meeting fetched successfully",
        "data": {
          "clientName": "John Doeyy",
          "serviceName": "Doula Consultation",
          "startTime": "1970-01-01T05:30:00.000Z",
          "timeToStart": "in 2541 mins",
          "meetingLink": "https://meet.google.com/ysm19g5e"
        }
      }
    },
  })
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
          "id": "655fa3dd-7b27-4371-b9e8-9bf4343b7735",
          "name": "Reena Smith",
          "title": "Certified Birth Doula",
          "averageRating": 4.7,
          "totalReviews": 3,
          "births": 0,
          "experience": 6,
          "satisfaction": 93,
          "qualification": "Certified Birth Doula (CBD)",
          "contact": {
            "email": "doula@test.com",
            "phone": "+919876543342",
            "location": "North Mumbai"
          },
          "about": "Certified birth doula with 6+ years of experience",
          "servicePricing": [
            {
              "servicePricingid": "0b4a9cc8-3ce5-4039-858d-9b60cb8b381f",
              "servicename": "Birth Doula",
              "price": {
                "night": 12,
                "fullday": 12,
                "morning": 15
              }
            },
            {
              "servicePricingid": "0cee20c7-14e5-498f-ab73-a5b8e38cac02",
              "servicename": "Post Partum Doula",
              "price": {
                "night": 1900,
                "fullday": 1900,
                "morning": 1900
              }
            },
            {
              "servicePricingid": "4924b14a-5b80-46f9-bb7e-29e89ed7c55b",
              "servicename": "Post Partum Doula",
              "price": {
                "night": 5,
                "fullday": 5,
                "morning": 5
              }
            },
            {
              "servicePricingid": "a7e7ebcc-8855-4c08-b6c1-76132ba676a6",
              "servicename": "Post Partum Doula",
              "price": {
                "night": 10,
                "fullday": 10,
                "morning": 1000
              }
            },
            {
              "servicePricingid": "f00e2a99-b097-4c3c-9783-75d5d09ba497",
              "servicename": "Birth Doula",
              "price": {
                "night": 1,
                "fullday": 100,
                "morning": 1
              }
            }
          ],
          "certificates": [
            {
              "certificateId": "1d87d45c-9730-423e-8fff-0b7ba21d95db",
              "name": "Advanceda Birth Support",
              "issuedBy": "WHO",
              "year": "2022"
            },
            {
              "certificateId": "d9907ca6-01fd-47e3-af61-65d555028982",
              "name": "Childbirth Educator",
              "issuedBy": "ABC Institute",
              "year": "2021"
            }
          ],
          "gallery": [
            {
              "id": "57c4ba33-5029-4123-8051-ddfa6aad2b06",
              "url": "uploads/doulas/1767165269144-747759397.jpeg",
              "altText": null
            },
            {
              "id": "97c0e4c8-54c5-4f72-8120-86803a4a9592",
              "url": "uploads/doulas/1767154479164-287555438.png",
              "altText": null
            }
          ]
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
  @Roles(Role.DOULA)
  @Post('profile/images')
  @UseInterceptors(
    FileInterceptor('profile_image'),
  )
  @ApiConsumes('multipart/form-data')
  async uploadDoulaImage(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
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
    return this.service.addDoulaprofileImage(req.user.id, profileImageUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('profile/images')
  async getDoulaImages(@Req() req) {
    return this.service.getDoulaImages(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Delete('profile/images/')
  async deleteDoulaImage(@Req() req) {
    return this.service.deleteDoulaprofileImage(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Post('gallery/images')
  @ApiConsumes('multipart/form-data')
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
  async getGalleryImages(@Req() req) {
    return this.service.getDoulaGalleryImages(req.user.id);
  }

  // =========================
  // DELETE GALLERY IMAGE
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Delete('gallery/images/:id')
  async deleteGalleryImage(@Req() req, @Param('id') imageId: string) {
    return this.service.deleteDoulaGalleryImage(req.user.id, imageId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Patch('app/profile')
  async updateDoulaProfile(@Req() req, @Body() dto: UpdateDoulaProfileDto) {
    return this.service.updateDoulaProfile(req.user.id, dto);
  }

  // UPDATE certificate
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Post('add/certificates/')
  async addCertificate(
    @Req() req,
    @Body() dto: CreateCertificateDto,
  ) {
    return this.service.addCertificate(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('list/certificates')
  async getCertificates(@Req() req) {
    return this.service.getCertificates(req.user.id);
  }

  // GET certificate by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('list/certificates/:id')
  async getCertificateById(@Req() req, @Param('id') certificateId: string) {
    return this.service.getCertificateById(req.user.id, certificateId);
  }

  // UPDATE certificate
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Patch('list/certificates/:id')
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
  async deleteCertificate(@Req() req, @Param('id') certificateId: string) {
    return this.service.deleteCertificate(req.user.id, certificateId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOULA)
  @Get('app/service-bookings')
  @ApiOperation({ summary: 'Get booked services of logged-in doula' })
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
            morning: true,
            night: false,
            fullday: false,
          },
        },
      },
    },
  })
  async getAvailableShifts(
    @Param('id') doulaId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('visitFrequency') visitFrequency: string,
  ) {
    return this.service.getAvailableShifts(
      doulaId,
      startDate,
      endDate,
      Number(visitFrequency),
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
}
