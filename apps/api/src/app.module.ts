import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './db/database.module';
import { CommonModule } from './common';
import { YouTubeModule } from './youtube/youtube.module';
import { ModulesModule } from './modules/modules.module';
import { LessonsModule } from './lessons/lessons.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { CatalogModule } from './catalog/catalog.module';
import { ProgressModule } from './progress/progress.module';
import { PlatformConfigModule } from './platform-config/platform-config.module';
import { AdminModule } from './admin/admin.module';
import { CategoriesModule } from './categories/categories.module';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule.register({
      jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
      googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
    }),
    UsersModule,
    YouTubeModule,
    ModulesModule,
    LessonsModule,
    CoursesModule,
    EnrollmentsModule,
    CatalogModule,
    ProgressModule,
    PlatformConfigModule,
    AdminModule,
    CategoriesModule,
    McpModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
