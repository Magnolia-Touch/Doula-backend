import { Module } from '@nestjs/common';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZoneManagerModule } from './zone_manager/zone_manager.module';
import { ServicesModule } from './services/services.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { DoulaModule } from './doula/doula.module';
import { EnquiryModule } from './enquiry-forms/enquiry-forms.module';
import { IntakeFormModule } from './intake-forms/intake-forms.module';
import { AvailableSlotsModule } from './meetings-availability/meetings-availability.module';
import { MeetingsModule } from './meetings/meetings.module';
import { RegionModule } from './regions/regions.module';
import { DoulaServiceAvailabilityModule } from './service-availability/service-availability.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { ServicePricingModule } from './service-pricing/service-pricing.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { ServiceBookingModule } from './service-bookings/service-booking.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ContactFormModule } from './contact-form/contact-form.module';
// import { FirebaseModule } from './firebase/firebase.module';
// import { NotificationModule } from './notifications/notifications.module';
import { DeviceTokenModule } from './token/device-token.module';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    ZoneManagerModule,
    ServicesModule,
    AuthModule,
    ClientModule,
    DoulaModule,
    EnquiryModule,
    IntakeFormModule,
    AvailableSlotsModule,
    MeetingsModule,
    RegionModule,
    DoulaServiceAvailabilityModule,
    ServicesModule,
    ZoneManagerModule,
    ServicePricingModule,
    AnalyticsModule,
    TestimonialsModule,
    // FirebaseModule,
    // NotificationModule,
    ClientModule,
    DeviceTokenModule,
    ContactFormModule,
    ServiceBookingModule,
    UserModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),

    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // your SMTP host
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <no-wishyougrowth@gmail.com>',
      },
      template: {
        dir: join(process.cwd(), 'src/templates'), // ✅ absolute path
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
