import { Body, Controller, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateContactFormDto } from './dto/contact-form.dto';
import { ContactFormService } from './contact-form.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
      'Allows users to submit a contact form with name, email, and message',
  })
  @ApiBody({ type: CreateContactFormDto })
  @ApiResponse({
    status: 201,
    description: 'Contact form submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request body',
  })
  @Post()
  async submit(@Body() dto: CreateContactFormDto) {
    return this.service.submitForm(dto);
  }
}
