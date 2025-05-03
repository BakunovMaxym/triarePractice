import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake?.headers?.auth;

    if (!token) {
      throw new WsException('Missing authentication token');
    }
    try {
      const user = this.jwtService.verify(token);
      
      client.user = user;

      return true;
    } catch {

      throw new WsException('Invalid or expired token');
    }
  }
}
