import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const user = context.switchToWs().getClient().user;
    return user;
  }
);