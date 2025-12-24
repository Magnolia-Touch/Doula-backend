import { Controller, Get, Patch, Param, Req, UseGuards, Body, UseInterceptors, Post, BadRequestException, UploadedFile, Delete } from '@nestjs/common';
import { ClientsService } from './client.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateClientDto } from './dto/update-client.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiConsumes } from '@nestjs/swagger';
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
      cb(null, './uploads/clients');
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
@Controller({
  path: 'clients',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientsService) { }

  //  SERVICE BOOKINGS
  // GET: All booked services
  @Get('booked-services')
  async getBookedServices(@Req() req) {
    return this.clientService.bookedServices(req.user.id);
  }

  // GET: Booked service by ID
  @Get('booked-services/:id')
  async getBookedServiceById(@Req() req, @Param('id') id: string) {
    return this.clientService.bookedServiceById(req.user.id, id);
  }

  // PATCH: Cancel service booking
  @Patch('booked-services/:id/cancel')
  async cancelServiceBooking(@Req() req, @Param('id') id: string) {
    return this.clientService.cancelServiceBooking(req.user.id, id);
  }

  // MEETINGS
  // GET: All meetings
  @Get('meetings')
  async getMeetings(@Req() req) {
    return this.clientService.Meetings(req.user.id);
  }

  // GET: Meeting by ID
  @Get('meetings/:id')
  async getMeetingById(@Req() req, @Param('id') id: string) {
    return this.clientService.meetingById(req.user.id, id);
  }

  // PATCH: Cancel meeting
  @Patch('meetings/:id/cancel')
  async cancelMeeting(@Req() req, @Param('id') id: string) {
    return this.clientService.cancelMeeting(req.user.id, id);
  }

  //  RECENT ACTIVITY
  // GET: Recent activity timeline
  @Get('recent-activity')
  async getRecentActivity(@Req() req) {
    return this.clientService.recentActivity(req.user.id);
  }

  // PROFILE
  // GET: Client profile
  @Get('profile')
  async getProfile(@Req() req) {
    return this.clientService.profile(req.user.id);
  }

  @Patch('profile')
  async updateProfile(@Req() req, @Body() dto: UpdateClientDto) {
    return this.clientService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Patch('profile/images')
  @UseInterceptors(
    FileInterceptor('profile_image', {
      storage: multerStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Unsupported file type'), false);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  async uploadDoulaImage(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Profile image is required');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        'Profile image exceeds maximum size of 5 MB.',
      );
    }

    const profileImageUrl = `uploads/clients/${file.filename}`;

    return this.clientService.addClientProfileImage(req.user.id, profileImageUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Get('profile/images')
  async getDoulaImages(@Req() req) {
    return this.clientService.getClientProfileImages(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Delete('profile/images/')
  async deleteDoulaImage(@Req() req) {
    return this.clientService.deleteClientProfileImage(req.user.id);
  }

}
