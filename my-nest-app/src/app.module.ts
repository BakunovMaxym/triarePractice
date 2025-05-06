import path from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { AuthModule } from './modules/auth/auth.module.ts';
import { HealthCheckerModule } from './modules/health-checker/health-checker.module.ts';
import { PostModule } from './modules/post/post.module.ts';
import { UserModule } from './modules/user/user.module.ts';
import { ApiConfigService } from './shared/services/api-config.service.ts';
import { SharedModule } from './shared/shared.module.ts';
import { CourseModule } from './modules/course/course.module.ts';

import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/sub-category/sub-category.module';
import { TaskModule } from './modules/tasks/tasks.module';
import { CommentModule } from './modules/comment/comment.module.ts';
import { UserTasksModule } from './modules/user-tasks/user-tasks.module';
import { CacheModule } from '@nestjs/cache-manager';
import { GoogleDriveModule } from './modules/google-drive/google-drive.module.ts';
import { FolderModule } from './modules/folder/folder.module';
import { TaskFileModule } from './modules/task-file/task-file.module.ts';

// @ts-ignore
const redisStore = (await import('cache-manager-ioredis')).default ?? (await import('cache-manager-ioredis'));

@Module({
  imports: [

    AuthModule,
    UserModule,
    PostModule,
    CourseModule,
    GoogleDriveModule,
    CategoryModule,
    SubCategoryModule,
    TaskModule,
    TaskFileModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),

    ThrottlerModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) => ({
        throttlers: [configService.throttlerConfigs],
      }),
      inject: [ApiConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.postgresConfig,
      inject: [ApiConfigService],
      dataSourceFactory: (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return Promise.resolve(
          addTransactionalDataSource(new DataSource(options)),
        );
      },
    }),
    // eslint-disable-next-line canonical/id-match
    I18nModule.forRootAsync({
      useFactory: (configService: ApiConfigService) => ({
        fallbackLanguage: configService.fallbackLanguage,
        loaderOptions: {
          path: path.join(import.meta.dirname, 'i18n/'),
          watch: configService.isDevelopment,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      imports: [SharedModule],
      inject: [ApiConfigService],
    }),
    HealthCheckerModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore, // Do NOT call it here
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        prefix: 'fefefe:',
      }),
    }),
    CourseModule,
    CategoryModule,
    SubCategoryModule,
    TaskModule,
    CommentModule,
    CommentModule,
    UserTasksModule,
    FolderModule,

  ],
  providers: [],
})
export class AppModule { }
