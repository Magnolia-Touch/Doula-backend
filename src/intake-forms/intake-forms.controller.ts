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

import { IntakeFormService } from './intake-forms.service';
import { BookDoulaDto, IntakeFormDto } from './dto/intake-form.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';

@ApiTags('Intake Forms')
@Controller({
  path: 'intake/forms',
  version: '1',
})
export class IntakeFormController {
  constructor(private readonly intakeService: IntakeFormService) { }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Intake Form' })
  @ApiBody({ type: IntakeFormDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "intake": {
            "id": "b013390b-d6a0-4f47-89aa-98e384eeb8c0",
            "startDate": "2025-12-04T18:30:00.000Z",
            "endDate": "2025-12-09T18:30:00.000Z",
            "location": null,
            "name": "John Doeyy",
            "email": "john1233@example.com",
            "phone": "9836540222",
            "address": "45 MG Road, Bengaluru, Karnataka",
            "regionId": "0ae960b7-e446-4a58-ada0-e8ef986ae5ac",
            "servicePricingId": "55febde5-5566-4bed-9f47-ada5f40b3143",
            "doulaProfileId": "01be9f0d-8c08-4091-a0ce-eec44acb063c",
            "clientId": "7b996eff-a473-4bd4-86b2-1c5573becb14",
            "createdAt": "2025-12-15T12:37:06.631Z",
            "updatedAt": "2025-12-15T12:37:06.631Z"
          },
          "booking": {
            "id": "9435182a-c874-4185-a258-72aa8442eec9",
            "startDate": "2025-12-04T18:30:00.000Z",
            "endDate": "2025-12-09T18:30:00.000Z",
            "paymentDetails": null,
            "status": "ACTIVE",
            "regionId": "0ae960b7-e446-4a58-ada0-e8ef986ae5ac",
            "servicePricingId": "55febde5-5566-4bed-9f47-ada5f40b3143",
            "doulaProfileId": "01be9f0d-8c08-4091-a0ce-eec44acb063c",
            "clientId": "7b996eff-a473-4bd4-86b2-1c5573becb14",
            "createdAt": "2025-12-15T12:37:06.631Z",
            "updatedAt": "2025-12-15T12:37:06.631Z",
            "cancelledAt": null
          },
          "schedulesCreated": 5
        }
      }
    },
  })
  @Post()
  create(@Body() dto: IntakeFormDto) {
    return this.intakeService.createIntakeForm(dto);
  }

  @ApiOperation({ summary: 'Get paginated intake forms' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": [
          {
            "intakeFormId": "054f1066-4caa-4b05-8358-564e72f5966b",
            "serviceStartDate": "2025-12-04T18:30:00.000Z",
            "serviceEndDate": "2025-12-09T18:30:00.000Z",
            "location": null,
            "clientName": "John Doeyy",
            "clientEmail": "john1233@example.com",
            "clientPhone": "9836540222",
            "regionName": "Kochi",
            "serviceName": "Doula Consultation",
            "servicePrice": "1500",
            "clientId": "6aa686a9-9b1e-47d4-af52-cfd329239ebb",
            "clientProfileId": "7b996eff-a473-4bd4-86b2-1c5573becb14",
            "userId": "63363154-ca36-45fe-91fe-4cf682eb97d1",
            "doulaProfileId": "01be9f0d-8c08-4091-a0ce-eec44acb063c"
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
  @Get()
  getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.intakeService.getAllForms(+page, +limit);
  }

  @ApiOperation({ summary: 'Get intake form by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Request successful",
        "data": {
          "intakeFormId": "dd13af5f-2613-4395-bbea-2b9da65b49d6",
          "serviceStartDate": "2027-01-01T00:00:00.000Z",
          "serviceEndDate": "2027-01-03T00:00:00.000Z",
          "location": null,
          "address": "45 MG Road, Bengaluru, Karnataka",
          "clientName": "hari",
          "clientEmail": "nandhudevanand4419@gmail.com",
          "clientPhone": "6896356838",
          "regionName": "Texas",
          "serviceName": "Birth Doula",
          "servicePrice": {
            "night": 15,
            "fullday": 25,
            "morning": 10
          },
          "clientId": "8411173d-0d5b-4b02-8e8c-2812c109d102",
          "clientProfileId": "08eb5dfb-d9cd-412f-b6eb-a25e4509edc4",
          "userId": "e3bfa8bb-4b0c-48d1-ad6f-77d3c0f48932",
          "doulaProfileId": "74c4c3c5-6031-4b45-9bc0-92e215db5927",
          "slots": [],
          "createdAt": "2026-01-06T15:42:06.459Z",
          "updatedAt": "2026-01-06T15:42:06.459Z"
        }
      }
    },
  })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.intakeService.getFormById(id);
  }

  @ApiOperation({ summary: 'Delete Intake Form' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Intake deleted successfully and slot unlocked",
        "data": {
          "message": "Intake deleted successfully and slot unlocked"
        }
      },
    },
  })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.intakeService.deleteForm(id);
  }

  //USELESS API
  @Delete()
  deleteallEnquiry() {
    return this.intakeService.deleteAllIntakeForms();
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Book Doula Service' })
  @ApiBody({ type: BookDoulaDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    schema: {
      example: {
        "status": "success",
        "message": "Booking created. Complete payment to confirm.",
        "data": {
          "message": "Booking created. Complete payment to confirm.",
          "bookingId": "beb0ea39-9802-48e0-8d19-d234ee1824e8",
          "paymentId": "43e619a2-4624-49ef-893a-d2007304e129",
          "amount": 3000,
          "payableAmount": 1000,
          "currency": "INR",
          "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_a1Y4kKIsBCUT9pzeCSw4aqCwr26JHHcYYlzoTRmCDJP03GSWjrsH37unVC#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VjJyRlU0Zkw3RjE9MEtrZHIwUnRtVW9fcnd%2FR25UT0t3SURual1gPFFAVUpPNUNwb3w8VmBEUTJmPFJsXGZCUUt2T25BZl9cSEpxUk1%2FQGZsXVR2Qkg2NTU3ZFdSbTN8TycpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl"
        }
      }
    },
  })
  @Post('book/doula')
  BookDoula(@Body() dto: BookDoulaDto, @Req() req) {
    return this.intakeService.BookDoula(dto, req.user.id);
  }
}
