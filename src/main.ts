import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import helmet from 'helmet';
import morgan from 'morgan';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const authService = app.get(AuthService);

  app.use(helmet());
  app.use(morgan('dev'));

  app.enableCors({
    origin: true,
    credentials: true,
  });

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

  app.setGlobalPrefix('api');

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
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await authService.initSuperAdmin();

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`🚀 http://localhost:${port}/api`);
  console.log(`📘 http://localhost:${port}/docs`);
}

bootstrap();
