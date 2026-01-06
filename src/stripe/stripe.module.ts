import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { WebhookService } from './webhook.service';
import { WebhookErrorHandlerService } from './webhook-error-handler.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServiceBookingModule } from 'src/service-bookings/service-booking.module';
import { MailModule } from 'src/mail/mail.module';

@Module({})
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      controllers: [StripeController],
      exports: [StripeService],
      imports: [ServiceBookingModule, PrismaModule, ConfigModule, MailModule], // NOT forRoot
      providers: [
        StripeService,
        WebhookService,
        WebhookErrorHandlerService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: (configService: ConfigService) =>
            configService.get<string>('STRIPE_SECRET_KEY'),
          inject: [ConfigService],
        },
      ],
    };
  }
}
