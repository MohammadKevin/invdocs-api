import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import helmet from 'helmet';
import morgan from 'morgan';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // 🔐 Security
  app.use(helmet());

  // 📜 Logging
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(morgan('dev'));

  // 🌐 CORS
  app.enableCors({
    origin: true, // nanti production bisa diganti domain spesifik
    credentials: true,
  });

  // ✅ Validation global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 🔗 Global prefix
  app.setGlobalPrefix('api');

  // 📘 Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Inventory API')
    .setDescription('API Dokumentasi untuk inventory management system')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token', // 👈 ini penting untuk @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}/api`);
  console.log(`📘 Swagger docs on http://localhost:${port}/docs`);
}

bootstrap();
