import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtService {
  constructor(private readonly jwtService: JwtService) {}

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token); 
    } catch (err) {
      throw new WsException('Invalid or expired token');
    }
  }
}