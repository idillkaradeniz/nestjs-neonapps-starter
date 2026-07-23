import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Skeleton for Day 6 — once auth middleware/guards attach a `user`
// object to the request, this decorator will extract it so controllers
// can write `@CurrentUser() user: User` instead of reaching into
// `req.user` by hand. Not wired to real auth yet.
export const CurrentUser = createParamDecorator(
  // boundary: validated — NestJS's own param-decorator signature.
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
