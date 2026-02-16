import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { formatDate } from 'date-fns';
import { Attachment } from 'nodemailer/lib/mailer';
import path from 'path';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mail: MailService,
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

  private safeFormatDate(date: any, pattern: string) {
    if (!date) return 'N/A';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';

    return formatDate(d, pattern);
  }

  private async handleCheckoutSessionCompleted(

    session: Stripe.Checkout.Session,
  ) {
    this.logger.log(
      `[StripeWebhook] handleCheckoutSessionCompleted triggered | session=${session.id}`,
    );

    if (session.payment_status !== 'paid') {
      this.logger.warn(
        `[StripeWebhook] Session completed but NOT PAID | session=${session.id}`,
      );
      return { received: true };
    }

    const { bookingId, paymentId } = session.metadata || {};

    if (!bookingId || !paymentId) {
      this.logger.error(
        `[StripeWebhook] Missing metadata | session=${session.id} | metadata=${JSON.stringify(session.metadata)}`,
      );
      return { received: true };
    }

    this.logger.log(
      `[StripeWebhook] Metadata OK | booking=${bookingId} | payment=${paymentId}`,
    );

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      this.logger.error(
        `[StripeWebhook] Payment not found | payment=${paymentId}`,
      );
      return { received: true };
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      this.logger.warn(
        `[StripeWebhook] Payment already processed | payment=${paymentId}`,
      );
      return { received: true };
    }

    const {
      visitDates,
      resolvedTimeShift,
      servicePricingId,
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      doulaProfileId,
      doulaName,
      doulaEmail,
      doulaPhone,
      serviceName,
      serviceStartDate,
      serviceEndDate,
      timeShift,
      regionId,
      regionName,
      totalAmount,
      currency,
    } = payment.metadata as any;

    this.logger.log(
      `[StripeWebhook] Payment metadata parsed | client=${clientEmail} | doula=${doulaEmail}`,
    );

    await this.prisma.$transaction(async (tx) => {
      this.logger.log(
        `[DB] Starting booking/payment transaction | booking=${bookingId}`,
      );

      await tx.serviceBooking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.PENDING },
      });

      // Race-condition protection: filter out dates that got booked
      // between payment initiation and webhook completion
      const validDates: string[] = [];
      for (const date of visitDates) {
        const existing = await tx.schedules.findFirst({
          where: {
            doulaProfileId,
            date: new Date(date),
            status: { not: 'CANCELED' },
          },
        });
        if (!existing) {
          validDates.push(date);
        } else {
          this.logger.warn(
            `[DB] Skipping already-booked date ${date} for doula ${doulaProfileId}`,
          );
        }
      }

      if (validDates.length > 0) {
        await tx.schedules.createMany({
          data: validDates.map((date: string) => ({
            date: new Date(date),
            timeshift: timeShift,
            doulaProfileId,
            serviceId: servicePricingId,
            clientId,
            bookingId,
          })),
        });
      }

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

      this.logger.log(
        `[DB] Transaction completed | booking=${bookingId} | payment=${paymentId} | scheduled=${validDates.length}/${visitDates.length} dates`,
      );
    });

    /**
     * ---------------- EMAIL DEBUGGING ----------------
     */
    this.logger.log(
      `[Email] Preparing booking confirmation emails | booking=${bookingId}`,
    );

    try {
      const commonContext = {
        appName: 'Bambini Doula',
        year: new Date().getFullYear(),
        serviceName,
        region: regionName,
        timeShift: timeShift,
        serviceStartDate: this.safeFormatDate(serviceStartDate, 'yyyy-MM-dd'),
        serviceEndDate: this.safeFormatDate(serviceEndDate, 'yyyy-MM-dd'),

        totalAmount: totalAmount,
      };

      /** -------- Doula Mail -------- */
      this.logger.log(
        `[Email] Sending email to DOULA | to=${doulaEmail}`,
      );

      await this.mail.sendMail({
        to: doulaEmail,
        subject: 'New Booking Assigned – Bambini Doula',
        template: 'doula-booking-confirmation',
        context: {
          ...commonContext,
          clientName,
          clientEmail,
          clientPhone,
        },
      });

      this.logger.log(
        `[Email] Doula email SENT successfully | to=${doulaEmail}`,
      );

      /** -------- Client Mail -------- */
      const attachments = this.getServiceAttachments(serviceName);

      this.logger.log(
        `[Email] Client email | to=${clientEmail} | attachments=${attachments.length}`,
      );

      if (attachments.length > 0) {
        this.logger.log(
          `[Email] Sending client email WITH attachments | service=${serviceName}`,
        );

        await this.mail.sendMailWithAttachments({
          to: clientEmail,
          subject: 'Your Booking is Confirmed – Bambini Doula',
          template: 'client-booking-confirmation',
          context: {
            ...commonContext,
            clientName,
            doulaName,
            doulaEmail,
            doulaPhone,
          },
          attachments,
        });

        this.logger.log(
          `[Email] Client email (with attachments) SENT | to=${clientEmail}`,
        );
      } else {
        this.logger.log(
          `[Email] Sending client email WITHOUT attachments`,
        );

        await this.mail.sendMail({
          to: clientEmail,
          subject: 'Your Booking is Confirmed – Bambini Doula',
          template: 'client-booking-confirmation',
          context: {
            ...commonContext,
            clientName,
            doulaName,
            doulaEmail,
            doulaPhone,
          },
        });

        this.logger.log(
          `[Email] Client email (no attachments) SENT | to=${clientEmail}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[Email] Booking confirmation email FAILED | booking=${bookingId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Booking completed, but confirmation email failed. Please contact support.',
      );
    }

    this.logger.log(
      `[StripeWebhook] SUCCESS | booking=${bookingId} | payment=${paymentId}`,
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


  private getServiceAttachments(serviceName: string): Attachment[] {
    const normalized = serviceName.trim().toLowerCase();

    const basePath = path.join(process.cwd(), 'assets');

    if (normalized === 'birth doula') {
      return [
        {
          filename: 'Birth-Doula-Contract.pdf',
          path: path.join(basePath, 'Birth-Doula-Contract.pdf'),
          contentType: 'application/pdf',
        },
      ];
    }

    if (normalized === 'post partum doula' || normalized === 'postpartum doula') {
      return [
        {
          filename: 'Postpartum-Contract.pdf',
          path: path.join(basePath, 'Postpartum-Contract.pdf'),
          contentType: 'application/pdf',
        },
      ];
    }

    return [];
  }

}
