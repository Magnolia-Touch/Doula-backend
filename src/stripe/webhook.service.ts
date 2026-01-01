import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      { apiVersion: '2025-12-15.clover' },
    );
  }

  /* ----------------------------------------------------
   * Verify Stripe Signature
   * -------------------------------------------------- */
  verifyWebhookSignature(
    body: Buffer,
    signature: string,
  ): Stripe.Event {
    const endpointSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!endpointSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret,
      );
    } catch (err: any) {
      this.logger.error('Webhook signature verification failed', err.message);
      throw new BadRequestException('Invalid Stripe webhook signature');
    }
  }

  /* ----------------------------------------------------
   * Entry point
   * -------------------------------------------------- */
  async processWebhookEvent(event: Stripe.Event) {
    this.logger.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );

      case 'checkout.session.expired':
        return this.handleCheckoutSessionExpired(
          event.data.object as Stripe.Checkout.Session,
        );

      case 'payment_intent.payment_failed':
        return this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );

      default:
        this.logger.warn(`Unhandled Stripe event: ${event.type}`);
        return { received: true };
    }
  }

  /* ----------------------------------------------------
   * Checkout session SUCCESS
   * -------------------------------------------------- */
  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    if (session.payment_status !== 'paid') {
      this.logger.warn(
        `Checkout session ${session.id} completed but not paid`,
      );
      return { received: true };
    }

    const { bookingId, paymentId } = session.metadata || {};

    if (!bookingId || !paymentId) {
      this.logger.error(
        `Missing metadata in checkout session ${session.id}`,
      );
      return { received: true };
    }

    console.log("hI devanand")
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    // Idempotency guard
    if (!payment || payment.status === PaymentStatus.SUCCESS) {
      this.logger.log(
        `Payment ${paymentId} already processed, skipping`,
      );
      return { received: true };
    }
    const {
      visitDates,
      serviceTimeShift,
      doulaProfileId,
      servicePricingId,
      clientId,

    } = payment.metadata as any;


    await this.prisma.$transaction(async (tx) => {
      await tx.serviceBooking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.PENDING, }
      })
      await tx.schedules.createMany({
        data: visitDates.map((date: string) => ({
          date: new Date(date),
          timeshift: serviceTimeShift,
          doulaProfileId,
          serviceId: servicePricingId,
          clientId,
          bookingId,
        })),
      });

      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCESS,
          paymentIntentId: String(session.payment_intent),
          paidAt: new Date(),
        },
      });

      await tx.serviceBooking.update({
        where: { id: bookingId },
        data: {
          isPaid: true,
          status: BookingStatus.ACTIVE,
        },
      });
    });

    this.logger.log(
      `Payment SUCCESS | booking=${bookingId} | payment=${paymentId}`,
    );

    return { received: true };
  }

  /* ----------------------------------------------------
   * Checkout session EXPIRED
   * -------------------------------------------------- */
  private async handleCheckoutSessionExpired(
    session: Stripe.Checkout.Session,
  ) {
    const { paymentId } = session.metadata || {};

    if (!paymentId) {
      return { received: true };
    }

    await this.prisma.payment.updateMany({
      where: {
        id: paymentId,
        status: PaymentStatus.PENDING,
      },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: 'Checkout session expired',
      },
    });

    this.logger.warn(
      `Checkout session expired | payment=${paymentId}`,
    );

    return { received: true };
  }

  /* ----------------------------------------------------
   * PaymentIntent FAILED
   * -------------------------------------------------- */
  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    const { paymentId } = paymentIntent.metadata || {};

    if (!paymentId) {
      return { received: true };
    }

    await this.prisma.payment.updateMany({
      where: {
        id: paymentId,
        status: PaymentStatus.PENDING,
      },
      data: {
        status: PaymentStatus.FAILED,
        failureReason:
          paymentIntent.last_payment_error?.message ||
          'Payment failed',
      },
    });

    this.logger.error(
      `Payment FAILED | payment=${paymentId} | intent=${paymentIntent.id}`,
    );

    return { received: true };
  }
}
