import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }

  /* ----------------------------------------------------
   * Create Checkout Session for Booking
   * -------------------------------------------------- */
  async createCheckoutLinkForBooking(
    booking: { id: string },
    payment: {
      id: string;
      amount: any; // Prisma Decimal | number
      currency?: string;
    },
    userEmail: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const unitAmount = Math.round(Number(payment.amount) * 100);

      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        throw new Error(`Invalid payment amount: ${payment.amount}`);
      }

      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],

        customer_email: userEmail,

        line_items: [
          {
            price_data: {
              currency: payment.currency?.toLowerCase() || 'inr',
              product_data: {
                name: 'Doula Service Booking',
                description: `Booking ID: ${booking.id}`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],

        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
        cancel_url: `${cancelUrl}?booking_id=${booking.id}`,

        metadata: {
          bookingId: booking.id,
          paymentId: payment.id,
          purpose: 'doula_service_booking',
        },

        payment_intent_data: {
          metadata: {
            bookingId: booking.id,
            paymentId: payment.id,
          },
        },
      });

      this.logger.log(
        `Checkout session created | booking=${booking.id} | payment=${payment.id} | amount=${unitAmount}`,
      );

      return session;
    } catch (error) {
      this.logger.error(
        'Failed to create Stripe Checkout Session',
        error.stack,
      );
      throw error;
    }
  }
}
