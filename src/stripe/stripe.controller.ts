import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly webhookService: WebhookService,
  ) { }

  /**
   * Stripe Webhook Endpoint
   * IMPORTANT:
   * - Raw body must be enabled in main.ts
   * - No JSON parsing here
   */
  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
  ) {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Missing stripe-signature header');
    }

    try {
      const event = this.webhookService.verifyWebhookSignature(
        req.rawBody!,
        signature,
      );

      await this.webhookService.processWebhookEvent(event);

      return res.status(HttpStatus.OK).json({ received: true });
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(error.message);
    }
  }
}
