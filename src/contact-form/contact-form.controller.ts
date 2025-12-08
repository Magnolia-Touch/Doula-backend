import { Body, Controller, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateContactFormDto } from './dto/contact-form.dto';
import { ContactFormService } from './contact-form.service';


@Controller({
  path: 'contact-form',
  version: '1',
})
export class ContactFormController {
  constructor(private readonly service: ContactFormService) { }

  @Post()
  async submit(@Body() dto: CreateContactFormDto) {
    return this.service.submitForm(dto);
  }
}
