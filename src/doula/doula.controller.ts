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
} from '@nestjs/common';
import { DoulaService } from './doula.service';
import { CreateDoulaDto } from './dto/create-doula.dto';
import { UpdateDoulaRegionDto } from './dto/update-doula.dto';
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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
            cb(null, './uploads/doulas');
        },
        filename: (req, file, cb) => {
            const safeName =
                Date.now() + '-' + Math.round(Math.random() * 1e9) + extname(file.originalname);
            cb(null, safeName);
        },
    });
}


@ApiTags('Doula')
@ApiBearerAuth('bearer')
@Controller({
    path: 'doula',
    version: '1',
})
export class DoulaController {
    constructor(private readonly service: DoulaService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ZONE_MANAGER')
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'images', maxCount: 5 }, // allow multiple images
            ],
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
    async create(
        @Body() dto: CreateDoulaDto,
        @Req() req,
        @UploadedFiles()
        files: {
            images?: Express.Multer.File[];
        },
    ) {
        const images = files?.images ?? [];

        const imagePayload = images.map((file, index) => ({
            url: `uploads/doulas/${file.filename}`,
            isMain: index === 0,   // first image = main
            sortOrder: index,
        }));

        const result = await this.service.create(
            dto,
            req.user.id,
            imagePayload
        );

        return {
            success: true,
            message: 'Doula created successfully',
            data: result.data,
        };
    }


    // GET LIST
    @Get()
    @ApiOperation({ summary: 'Get all doulas with filters & pagination' })

    // pagination
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })

    // search
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, email, phone, region' })

    // existing filters
    @ApiQuery({ name: 'serviceId', required: false, type: String })
    @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })

    // new filters
    @ApiQuery({ name: 'regionName', required: false, type: String })
    @ApiQuery({ name: 'minExperience', required: false, type: Number, description: 'Minimum years of experience' })
    @ApiQuery({ name: 'serviceName', required: false, type: String })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'ISO date yyyy-MM-dd' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'ISO date yyyy-MM-dd' })

    @ApiOkResponse({
        description: 'Returns a filtered & paginated list of doulas'
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
    @ApiOperation({ summary: 'Get a Doula by ID' })
    @ApiParam({ name: 'id', required: true, description: 'Doula UUID' })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doula fetched',
                data: {
                    id: 'doula-uuid',
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    phone: '+919876543210',
                    regions: [{ id: 'region-1', name: 'Region A' }]
                }
            }
        }
    })
    async getById(@Param('id') id: string) {
        return this.service.getById(id);
    }

    // DELETE
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ZONE_MANAGER')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a Doula' })
    @ApiParam({ name: 'id', required: true, description: 'Doula UUID' })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: { success: true, message: 'Doula deleted', data: null }
        }
    })
    async delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    // UPDATE STATUS
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ZONE_MANAGER')
    @Patch(':id/update/status/')
    @ApiOperation({ summary: 'Update Doula status' })
    @ApiParam({ name: 'id', description: 'Doula ID' })
    @ApiBody({ type: UpdateDoulaStatusDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: { success: true, message: 'Status updated', data: { id: 'doula-uuid', isActive: true } }
        }
    })
    async updateStatus(@Param('id') id: string, @Body() body: UpdateDoulaStatusDto) {
        return this.service.updateStatus(id, body.isActive);
    }

    // UPDATE DOULA REGIONS
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ZONE_MANAGER')
    @Patch('update/regions')
    @ApiOperation({ summary: 'Add or remove regions from a Doula' })
    @ApiBody({ type: UpdateDoulaRegionDto })
    @ApiResponse({
        status: 200,
        type: SwaggerResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Doula regions updated',
                data: { profileId: 'profile-uuid', regionIds: ['r1', 'r2'], purpose: 'add' }
            }
        }
    })
    async updateRegions(@Body() dto: UpdateDoulaRegionDto, @Req() req) {
        return this.service.UpdateDoulaRegions(dto, req.user.id);
    }
}
