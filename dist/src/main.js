"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.setGlobalPrefix('backend');
    app.enableVersioning({
        type: common_2.VersioningType.URI,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Doulas API')
        .setDescription('API documentation for Doulas management system')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
    }, 'bearer')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {});
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
        customSiteTitle: 'Doulas API Docs',
    });
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Server running at http://localhost:${process.env.PORT ?? 3000}`);
    console.log('📚 Swagger docs: http://localhost:' +
        (process.env.PORT ?? 3000) +
        '/api/docs');
}
bootstrap();
//# sourceMappingURL=main.js.map