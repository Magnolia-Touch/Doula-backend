import { Controller, Get } from '@nestjs/common';
import { EmailProducer } from './email.producer';

@Controller({
  path: 'test/queue',
  version: '1',
})
export class QueueController {
  constructor(private readonly service: EmailProducer) {}

  @Get('test-mail-queue')
  async testQueue() {
    await this.service.sendMail({
      to: 'test@example.com',
      subject: 'Queue Test',
      html: '<h1>Queue works</h1>',
    });

    return { ok: true };
  }
}
