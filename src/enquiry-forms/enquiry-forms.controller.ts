import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EnquiryService } from './enquiry-forms.service';
import { EnquiryFormDto } from './dto/create-enquiry-forms.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Enquiry Forms')
@Controller({
  path: 'enquiry/form',
  version: '1',
})
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) { }

  @ApiOperation({ summary: 'Submit an enquiry form' })
  @ApiBody({ type: EnquiryFormDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Enquiry submitted successfully",
        "data": {
          "message": "Enquiry submitted successfully",
          "enquiry": {
            "id": "d04b6c19-967c-4829-8f40-65fd6c2edb8f",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "9876543210",
            "additionalNotes": "Looking for postpartum support during night hours.",
            "meetingsDate": "2025-12-08T00:00:00.000Z",
            "meetingsTimeSlots": "09:00-11:00",
            "seviceStartDate": null,
            "serviceEndDate": null,
            "VisitFrequency": 1,
            "serviceTimeSlots": null,
            "serviceName": "Birth Doula",
            "createdAt": "2026-01-02T13:08:18.093Z",
            "updatedAt": "2026-01-02T13:08:18.093Z",
            "regionId": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
            "slotId": "35c85a08-941b-4213-b1c1-397e5a4b06c3",
            "serviceId": "26c11b42-417c-4e37-8543-4ef609646718",
            "clientId": "6dd1d8f1-a75c-4d20-aa4c-44d36bcc7c03",
            "Meetings": {
              "id": "48bce37b-4064-4fba-9eea-72c63775105e",
              "link": "https://meet.google.com/ps0t72rb",
              "status": "SCHEDULED",
              "startTime": "1970-01-01T03:30:00.000Z",
              "endTime": "1970-01-01T05:30:00.000Z",
              "date": "2025-12-08T00:00:00.000Z",
              "serviceName": "Birth Doula",
              "remarks": "Looking for postpartum support during night hours.",
              "bookedById": "6dd1d8f1-a75c-4d20-aa4c-44d36bcc7c03",
              "createdAt": "2026-01-02T13:08:18.098Z",
              "updatedAt": "2026-01-02T13:08:18.098Z",
              "cancelledAt": null,
              "rescheduledAt": null,
              "availableSlotsForMeetingId": "35c85a08-941b-4213-b1c1-397e5a4b06c3",
              "zoneManagerProfileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
              "doulaProfileId": null,
              "adminProfileId": null,
              "serviceId": null,
              "enquiryId": "d04b6c19-967c-4829-8f40-65fd6c2edb8f"
            }
          }
        }
      }
    },
  })
  @Post()
  async submit(@Body() dto: EnquiryFormDto) {
    return this.enquiryService.submitEnquiry(dto);
  }

  @ApiOperation({ summary: 'Get paginated list of enquiries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": [
          {
            "id": "4a2f15ea-15db-47b6-a061-9e6cff9de936",
            "name": "anil",
            "email": "nandhudevanand4419@gmail.com",
            "phone": "9876543230",
            "additionalNotes": "Looking for postpartum support during night hours.",
            "meetingsDate": "2025-12-31T00:00:00.000Z",
            "meetingsTimeSlots": "11:00-11:30",
            "seviceStartDate": null,
            "serviceEndDate": null,
            "VisitFrequency": 1,
            "serviceTimeSlots": null,
            "serviceName": "Birth Doula",
            "createdAt": "2026-01-06T13:16:52.530Z",
            "updatedAt": "2026-01-06T13:16:52.530Z",
            "regionId": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
            "slotId": "b555c144-b4dc-490c-8ffd-f6efe16cc5bb",
            "serviceId": "26c11b42-417c-4e37-8543-4ef609646718",
            "clientId": "08eb5dfb-d9cd-412f-b6eb-a25e4509edc4"
          },
          {
            "id": "92bc6235-e6f9-46c4-92da-6fb5aa2536b6",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "9876543210",
            "additionalNotes": "Looking for postpartum support during night hours.",
            "meetingsDate": "2025-12-05T00:00:00.000Z",
            "meetingsTimeSlots": "09:00-11:00",
            "seviceStartDate": null,
            "serviceEndDate": null,
            "VisitFrequency": 1,
            "serviceTimeSlots": null,
            "serviceName": "Birth Doula",
            "createdAt": "2026-01-02T12:00:54.028Z",
            "updatedAt": "2026-01-02T12:00:54.028Z",
            "regionId": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
            "slotId": "834c96e9-7ef5-40be-885a-be24699129d2",
            "serviceId": "26c11b42-417c-4e37-8543-4ef609646718",
            "clientId": "6dd1d8f1-a75c-4d20-aa4c-44d36bcc7c03"
          }
        ],
        "meta": {
          "total": 7,
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
  @Roles(Role.ZONE_MANAGER)
  @Get()
  getAllEnquiries(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req,
  ) {
    return this.enquiryService.getAllEnquiries(
      parseInt(page),
      parseInt(limit),
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Get enquiry by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "id": "4a2f15ea-15db-47b6-a061-9e6cff9de936",
          "name": "anil",
          "email": "nandhudevanand4419@gmail.com",
          "phone": "9876543230",
          "additionalNotes": "Looking for postpartum support during night hours.",
          "meetingsDate": "2025-12-31T00:00:00.000Z",
          "meetingsTimeSlots": "11:00-11:30",
          "seviceStartDate": null,
          "serviceEndDate": null,
          "VisitFrequency": 1,
          "serviceTimeSlots": null,
          "serviceName": "Birth Doula",
          "createdAt": "2026-01-06T13:16:52.530Z",
          "updatedAt": "2026-01-06T13:16:52.530Z",
          "regionId": "b6d5f121-9e09-436f-af18-39f3e5a824c7",
          "slotId": "b555c144-b4dc-490c-8ffd-f6efe16cc5bb",
          "clientId": "08eb5dfb-d9cd-412f-b6eb-a25e4509edc4",
          "serviceId": "26c11b42-417c-4e37-8543-4ef609646718",
          "Meetings": {
            "id": "4ba2318f-b569-4a7b-a664-130f9ccc9e23",
            "link": "https://meet.google.com/n24204fn",
            "status": "SCHEDULED",
            "startTime": "1970-01-01T05:30:00.000Z",
            "endTime": "1970-01-01T06:00:00.000Z",
            "date": "2025-12-31T00:00:00.000Z",
            "serviceName": "Birth Doula",
            "remarks": "Looking for postpartum support during night hours.",
            "bookedById": "08eb5dfb-d9cd-412f-b6eb-a25e4509edc4",
            "createdAt": "2026-01-06T13:16:52.537Z",
            "updatedAt": "2026-01-06T13:16:52.537Z",
            "cancelledAt": null,
            "rescheduledAt": null,
            "availableSlotsForMeetingId": "b555c144-b4dc-490c-8ffd-f6efe16cc5bb",
            "zoneManagerProfileId": "f88c9e79-66b0-4d3b-968a-7df22bdaee50",
            "doulaProfileId": null,
            "adminProfileId": null,
            "serviceId": null,
            "enquiryId": "4a2f15ea-15db-47b6-a061-9e6cff9de936"
          }
        }
      }
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ZONE_MANAGER)
  @Get(':id')
  getEnquiryById(@Param('id') id: string, @Req() req) {
    return this.enquiryService.getEnquiryById(id, req.user.id);
  }

  @ApiOperation({ summary: 'Delete enquiry' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: { success: true, message: 'Enquiry deleted', data: null },
    },
  })
  @Delete(':id')
  deleteEnquiry(@Param('id') id: string) {
    return this.enquiryService.deleteEnquiry(id);
  }

  @ApiOperation({ summary: 'Delete all enquiries' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "All enquiry forms deleted successfully",
        "data": {
          "message": "All enquiry forms deleted successfully",
          "deletedCount": 11
        }
      },
    },
  })
  @Delete()
  deleteallEnquiry() {
    return this.enquiryService.deleteAllEnquiryForms();
  }
}
