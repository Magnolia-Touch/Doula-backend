import { Controller, Get } from '@nestjs/common';
import { EmailProducer } from './email.producer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Mail Queue (Testing)')
@Controller({
  path: 'test/queue',
  version: '1',
})
export class QueueController {
  constructor(private readonly service: EmailProducer) { }

  @Get('test-mail-queue')
  @ApiOperation({
    summary: 'Test mail queue',
    description:
      'Test endpoint to verify the email queue system is working correctly. Sends a test email to test@example.com.',
  })
  @ApiResponse({
    status: 200,
    description: 'Test email added to queue successfully',
    schema: {
      example: {
        ok: true,
        message: 'Test email queued for sending',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Queue service error',
  })
  async testQueue() {
    await this.service.sendMail({
      to: 'test@example.com',
      subject: 'Queue Test',
      html: '<h1>Queue works</h1>',
    });

    return { ok: true };
  }
}
