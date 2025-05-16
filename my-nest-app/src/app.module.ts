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
import { UserModule } from './modules/user/user.module.ts';
import { ApiConfigService } from './shared/services/api-config.service.ts';
import { SharedModule } from './shared/shared.module.ts';
import { SetingsModule } from './modules/setings/setings.module';
import { ColectionModule } from './modules/colections/colection.module.ts';
import { PropertyCardsModule } from './modules/property-cards/property-cards.module.ts';
import { GameModule } from './modules/game/game.module';
import { PropertyModule } from './modules/property/property.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ComunityChestModule } from './modules/comunity-chest/comunity-chest.module';
import { ChanceCardsModule } from './modules/chance-cards/chance-cards.module';
import { TurnsModule } from './modules/turns/turns.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
// @ts-ignore
const redisStore = (await import('cache-manager-ioredis')).default ?? (await import('cache-manager-ioredis'));



@Module({
  imports: [
    AuthModule,
    UserModule,
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
    SetingsModule,
    PropertyCardsModule,
    ColectionModule,
    GameModule,
    PropertyModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore, // Do NOT call it here
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        prefix: 'fefefe:',
      }),
    }),
    ComunityChestModule,
    ChanceCardsModule,
    TurnsModule,
    EventEmitterModule.forRoot(),
    

  ],
  providers: [],
})
export class AppModule {}
