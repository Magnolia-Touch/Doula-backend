import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  Logger,
  Get,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller({
  path: 'stripe',
  version: '1',
})
export class StripeController {
  constructor(
    private readonly webhookService: WebhookService,
  ) { }

  @Get('webhook')
  testWebhook() {
    return { ok: true };
  }
  /**
   * Stripe Webhook Endpoint
   * IMPORTANT:
   * - Raw body must be enabled in main.ts
   * - No JSON parsing here
   */
  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('Body is buffer:', Buffer.isBuffer(req.body));
    console.log('Body length:', (req.body as Buffer)?.length);

    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Missing stripe-signature header');
    }

    try {
      // ✅ USE req.body (Buffer)
      const event = this.webhookService.verifyWebhookSignature(
        req.body as Buffer,
        signature,
      );

      await this.webhookService.processWebhookEvent(event);

      return res.status(HttpStatus.OK).json({ received: true });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send(error.message);
    }
  }

}
