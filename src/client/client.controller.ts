import {
    Controller,
    Get,
    Patch,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ClientsService } from './client.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller({
    path: 'clients',
    version: '1',
})
@UseGuards(JwtAuthGuard)
export class ClientController {
    constructor(private readonly clientService: ClientsService) { }

    /* =======================
       SERVICE BOOKINGS
       ======================= */

    // GET: All booked services
    @Get('booked-services')
    async getBookedServices(@Req() req) {
        return this.clientService.bookedServices(req.user.id);
    }

    // GET: Booked service by ID
    @Get('booked-services/:id')
    async getBookedServiceById(
        @Req() req,
        @Param('id') id: string,
    ) {
        return this.clientService.bookedServiceById(req.user.id, id);
    }

    // PATCH: Cancel service booking
    @Patch('booked-services/:id/cancel')
    async cancelServiceBooking(
        @Req() req,
        @Param('id') id: string,
    ) {
        return this.clientService.cancelServiceBooking(req.user.id, id);
    }

    /* =======================
       MEETINGS
       ======================= */

    // GET: All meetings
    @Get('meetings')
    async getMeetings(@Req() req) {
        return this.clientService.Meetings(req.user.id);
    }

    // GET: Meeting by ID
    @Get('meetings/:id')
    async getMeetingById(
        @Req() req,
        @Param('id') id: string,
    ) {
        return this.clientService.meetingById(req.user.id, id);
    }

    // PATCH: Cancel meeting
    @Patch('meetings/:id/cancel')
    async cancelMeeting(
        @Req() req,
        @Param('id') id: string,
    ) {
        return this.clientService.cancelMeeting(req.user.id, id);
    }

    /* =======================
       RECENT ACTIVITY
       ======================= */

    // GET: Recent activity timeline
    @Get('recent-activity')
    async getRecentActivity(@Req() req) {
        return this.clientService.recentActivity(req.user.id);
    }

    /* =======================
       PROFILE
       ======================= */

    // GET: Client profile
    @Get('profile')
    async getProfile(@Req() req) {
        return this.clientService.profile(req.user.id);
    }
}
