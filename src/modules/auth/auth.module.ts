import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Env } from '../shared/config/env.schema';
import { UsersModule } from '../user/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenRepository } from './refresh-token.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // registerAsync because the secret/expiry come from ConfigService,
    // not a hardcoded value. This registers the ACCESS-token signer
    // (JwtService default). Refresh tokens are signed by hand in
    // AuthService with a different secret — see issueTokens().
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN', {
            infer: true,
          }),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenRepository,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Registered AFTER JwtAuthGuard on purpose — Nest runs multiple
    // APP_GUARD providers in the order they're listed here. Auth must
    // resolve request.user BEFORE RolesGuard tries to read user.role.
    { provide: APP_GUARD, useClass: RolesGuard },
    // Registered AFTER RolesGuard — this is a finer-grained second check.
    // A route can use @Roles(), @RequirePermission(), both, or neither;
    // whichever guard has metadata for the route enforces it.
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AuthModule {}
