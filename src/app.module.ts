import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RackModule } from './rack/rack.module';
import { BoxesModule } from './boxes/boxes.module';
import { DocumentsModule } from './documents/documents.module';

import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),

      serveRoot: '/uploads',

      serveStaticOptions: {
        index: false,
      },
    }),

    AuthModule,
    PrismaModule,
    UsersModule,
    RackModule,
    BoxesModule,
    DocumentsModule,
    ReportsModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
