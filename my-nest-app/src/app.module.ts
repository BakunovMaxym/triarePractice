import path from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { UserTaskFileModule } from './modules/user-task-file/user-task-file.module.ts';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { CroneTaskModule } from './modules/crone-task/crone-task.module.ts';
import { upstashStore } from './cache/upstash-cache-store';
// import { MailModule } from '../../shared/mail/mail.module.js';
import { MailModule } from './shared/mail/mail.module.ts';

import { redisStore } from 'cache-manager-ioredis-yet';



@Module({
  imports: [

    AuthModule,
    UserModule,
    CourseModule,
    GoogleDriveModule,
    CategoryModule,
    SubCategoryModule,
    UserTasksModule,
    CroneTaskModule,
    TaskFileModule,
    UserTaskFileModule,
    MailModule,
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
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "sometestexampleforspammails@gmail.com",
          pass: "jhcw revd mwgm jaky",
        },
      },
      defaults: {
        from: "Learning Management System <sometestexampleforspammails@gmail.com>",
      }
    }),
    ScheduleModule.forRoot(),
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
    CacheModule.registerAsync({
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: async (configService: ApiConfigService) => {
        if (configService.isDevelopment) {
          console.log('🧠 Trying to connect to Redis...');
          const store = await redisStore({
            host: process.env.REDIS_HOST ?? 'localhost',
            port: Number(process.env.REDIS_PORT ?? 6379),
          });
          console.log('✅ Redis connected!');
          return { store };
        }

        console.log('🧠 Using Upstash store...');
        return { store: await upstashStore() };
      },
      isGlobal: true,
    }),

    CourseModule,
    CategoryModule,
    SubCategoryModule,
    TaskModule,
    CommentModule,
    CommentModule,
    FolderModule,

  ],
  providers: [],
})
export class AppModule { }
