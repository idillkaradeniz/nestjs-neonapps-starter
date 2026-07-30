import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Env } from '../../shared/config/env.schema';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

// Passport strategy for access tokens ONLY — refresh tokens are verified
// by hand in AuthService.refresh() (different secret, different payload
// shape, and they need a DB round-trip against refresh_tokens that a
// Passport strategy has no clean place to do).
//
// passport-jwt does the signature + expiry check BEFORE validate() ever
// runs. If the token is missing, expired, or the signature doesn't
// match, validate() is never called — Passport calls done(err/info)
// instead, which JwtAuthGuard.handleRequest() below translates into our
// typed AUTH_TOKEN_MISSING / AUTH_TOKEN_EXPIRED / AUTH_TOKEN_INVALID
// codes. validate() only runs for a structurally-valid, unexpired token.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
