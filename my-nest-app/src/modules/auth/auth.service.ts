import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ApiConfigService } from '../../shared/services/api-config.service.ts';
import { TokenPayloadDto } from './dto/token-payload.dto.ts';
import type { UserDto } from 'modules/user/dtos/user.dto.ts';

@Injectable() 
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ApiConfigService,
  ) {}

  async createAccessToken(data: {
    user: UserDto
  }): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      expiresIn: this.configService.authConfig.jwtExpirationTime,
      accessToken: await this.jwtService.signAsync({
        user: data.user, 
      }),
    });
  }



}
