import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { NestExpressApplication } from '@nestjs/platform-express';

import helmet from 'helmet';

import morgan from 'morgan';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { join } from 'path';

import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  const uploadPath = join(process.cwd(), 'uploads');

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
      recursive: true,
    });
  }

  app.useStaticAssets(join(process.cwd(), 'uploads'));

  app.use(helmet());

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);

  console.log(`📘 Swagger: http://localhost:${port}/docs`);

  console.log(
    `📂 Uploads: http://localhost:${port}/uploads/documents/file.jpg`,
  );
}

bootstrap();
