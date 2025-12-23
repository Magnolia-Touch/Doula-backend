"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const zone_manager_module_1 = require("./zone_manager/zone_manager.module");
const services_module_1 = require("./services/services.module");
const auth_module_1 = require("./auth/auth.module");
const client_module_1 = require("./client/client.module");
const doula_module_1 = require("./doula/doula.module");
const enquiry_forms_module_1 = require("./enquiry-forms/enquiry-forms.module");
const intake_forms_module_1 = require("./intake-forms/intake-forms.module");
const meetings_availability_module_1 = require("./meetings-availability/meetings-availability.module");
const meetings_module_1 = require("./meetings/meetings.module");
const regions_module_1 = require("./regions/regions.module");
const service_availability_module_1 = require("./service-availability/service-availability.module");
const mailer_1 = require("@nestjs-modules/mailer");
const path_1 = require("path");
const pug_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/pug.adapter");
const service_pricing_module_1 = require("./service-pricing/service-pricing.module");
const analytics_module_1 = require("./analytics/analytics.module");
const testimonials_module_1 = require("./testimonials/testimonials.module");
const service_booking_module_1 = require("./service-bookings/service-booking.module");
const serve_static_1 = require("@nestjs/serve-static");
const contact_form_module_1 = require("./contact-form/contact-form.module");
const device_token_module_1 = require("./token/device-token.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            zone_manager_module_1.ZoneManagerModule,
            services_module_1.ServicesModule,
            auth_module_1.AuthModule,
            client_module_1.ClientModule,
            doula_module_1.DoulaModule,
            enquiry_forms_module_1.EnquiryModule,
            intake_forms_module_1.IntakeFormModule,
            meetings_availability_module_1.AvailableSlotsModule,
            meetings_module_1.MeetingsModule,
            regions_module_1.RegionModule,
            service_availability_module_1.DoulaServiceAvailabilityModule,
            services_module_1.ServicesModule,
            zone_manager_module_1.ZoneManagerModule,
            service_pricing_module_1.ServicePricingModule,
            analytics_module_1.AnalyticsModule,
            testimonials_module_1.TestimonialsModule,
            client_module_1.ClientModule,
            device_token_module_1.DeviceTokenModule,
            contact_form_module_1.ContactFormModule,
            service_booking_module_1.ServiceBookingModule,
            users_module_1.UserModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
                serveStaticOptions: {
                    index: false,
                },
            }),
            mailer_1.MailerModule.forRoot({
                transport: {
                    host: 'smtp.gmail.com',
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
                    dir: (0, path_1.join)(process.cwd(), 'src/templates'),
                    adapter: new pug_adapter_1.PugAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map