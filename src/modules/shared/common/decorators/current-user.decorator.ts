import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../../../auth/interfaces/authenticated-user.interface';

// Finished (Day 7): JwtAuthGuard runs before any handler and, via
// JwtStrategy.validate(), sets request.user to an AuthenticatedUser.
// This decorator just reaches in and hands it back, typed, so handlers
// can write `@CurrentUser() user: AuthenticatedUser` instead of reaching
// into `req.user` by hand. Only usable on routes NOT marked @Public() —
// a public route never reaches JwtStrategy, so request.user is unset there.
export const CurrentUser = createParamDecorator(
  // boundary: validated — NestJS's param-decorator signature; request.user is only ever set by JwtStrategy.validate().
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
