import { SetMetadata } from '@nestjs/common';

// Marks a route handler as exempt from JwtAuthGuard, which is
// registered globally (APP_GUARD) — everything is protected by
// default, and a route only becomes reachable without a token if
// someone consciously adds @Public() to it. Same pattern as
// @RawResponse() from Day 6: a metadata flag the guard checks via
// Reflector.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
