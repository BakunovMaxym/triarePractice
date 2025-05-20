import { forwardRef, Module } from '@nestjs/common';
import { JwtModule} from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../user/user.module.ts';
import { AuthService } from './auth.service.ts';
import { JwtStrategy } from './jwt.strategy.ts';
import { PublicStrategy } from './public.strategy.ts';
import { WsJwtService } from './ws-jwt.service.ts';
import { ApiConfigService } from '../../shared/services/api-config.service.ts';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
          useFactory: (configService: ApiConfigService) => ({
            privateKey: configService.authConfig.privateKey,
            publicKey: configService.authConfig.publicKey,
            signOptions: {
              algorithm: 'RS256',
              //     expiresIn: configService.getNumber('JWT_EXPIRATION_TIME'),
            },
            verifyOptions: {
              algorithms: ['RS256'],
            },
            // if you want to use token with expiration date
            // signOptions: {
            //     expiresIn: configService.getNumber('JWT_EXPIRATION_TIME'),
            // },
          }),
          inject: [ApiConfigService],
        })
  ],
  controllers: [],
  providers: [AuthService, JwtStrategy, PublicStrategy,WsJwtService],
  exports: [ AuthService, WsJwtService, JwtModule],
})
export class AuthModule {}
