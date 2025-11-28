// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Optional: set a global prefix (nice for staging/prod)
  app.setGlobalPrefix('backend');
  app.enableVersioning({
    type: VersioningType.URI
  })


  // Enable validation pipe so class-validator/class-transformer metadata is consistent
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));


  const config = new DocumentBuilder()
    .setTitle('Doulas API')
    .setDescription('API documentation for Doulas management system')
    .setVersion('1.0')
    // Add a named bearer scheme so you can reference it in controllers with @ApiBearerAuth('bearer')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'bearer', // name of the security scheme
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    // include all modules by default; if you need to include/exclude files, use extraOptions
    // deepScanRoutes: true // sometimes helpful for dynamic modules
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Doulas API Docs',
  });

  // Keep your response interceptor (Swagger uses DTOs not this interceptor)
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running at http://localhost:${process.env.PORT ?? 3000}`);
  console.log('📚 Swagger docs: http://localhost:' + (process.env.PORT ?? 3000) + '/api/docs');
}
bootstrap();
