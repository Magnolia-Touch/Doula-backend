import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateContactFormDto } from './dto/contact-form.dto';
import { ContactFormService } from './contact-form.service';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { SwaggerResponseDto } from 'src/common/dto/swagger-response.dto';

@ApiTags('Contact Form')
@Controller({
  path: 'contact-form',
  version: '1',
})
export class ContactFormController {
  constructor(private readonly service: ContactFormService) {}

  @ApiOperation({
    summary: 'Submit contact form',
    description:
      'Allows visitors and users to submit a contact form with their name, email, phone, and message. This is a public endpoint.',
  })
  @ApiBody({ type: CreateContactFormDto })
  @ApiResponse({
    status: 201,
    type: SwaggerResponseDto,
    description: 'Contact form submitted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Contact form submitted successfully',
        data: {
          id: 'contact-uuid-123',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1-234-567-8900',
          message: 'I would like to know more about your services.',
          createdAt: '2026-04-09T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request body',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'name should not be empty',
          'email must be an email',
        ],
        error: 'Bad Request',
      },
    },
  })
  @Post()
  async submit(@Body() dto: CreateContactFormDto) {
    return this.service.submitForm(dto);
  }
}
