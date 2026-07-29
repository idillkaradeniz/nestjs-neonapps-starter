import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { Env } from '../shared/config/env.schema';
import { comparePassword } from '../shared/common/utils/password-hasher';
import { compareTokenHash, hashToken } from '../shared/common/utils/token-hasher';
import { REDIS_TOKENS } from '../shared/redis/redis.tokens';
import { UserRepository } from '../user/users/user.repository';
import { UserService } from '../user/users/user.service';
import { AuthErrors } from './auth-errors.constant';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokens } from './interfaces/auth-tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenPayload } from './interfaces/refresh-token-payload.interface';
import { RefreshTokenRepository } from './refresh-token.repository';

// Login attempts are counted per IP, in a fixed one-minute window — a
// teaser for the real rate limiter Day 10 builds; here it's just
// Redis INCR + EXPIRE.
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
    @Inject(REDIS_TOKENS.CLIENT) private readonly redis: Redis,
  ) {}

  // Reuses UserService.create() — register is "create a user, then log
  // them in." Same hashing, same email-uniqueness check, same
  // PublicUserRow-shaped result; no duplicated logic.
  async register(dto: RegisterDto): Promise<AuthTokens> {
    const user = await this.userService.create(dto);
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto, ip: string): Promise<AuthTokens> {
    await this.enforceLoginRateLimit(ip);

    const email = dto.email.trim();
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw AuthErrors.invalidCredentials();
    }
    const passwordMatches = await comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw AuthErrors.invalidCredentials();
    }
    return this.issueTokens(user.id, user.email);
  }

  // Rotation: the old refresh token's DB row is deleted and a brand new
  // access+refresh pair is issued. A refresh token can only ever be used
  // once — reusing an already-rotated one fails the findById lookup and
  // is treated as invalid (a real system would also want to treat reuse
  // as a signal of a stolen token and revoke the whole family; out of
  // scope for today's teaser).
  async refresh(dto: RefreshTokenDto): Promise<AuthTokens> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(
        dto.refreshToken,
        { secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }) },
      );
    } catch {
      throw AuthErrors.refreshTokenInvalid();
    }

    const row = await this.refreshTokenRepository.findById(payload.jti);
    if (!row) {
      throw AuthErrors.refreshTokenInvalid();
    }
    if (row.expiresAt.getTime() < Date.now()) {
      await this.refreshTokenRepository.deleteById(row.id);
      throw AuthErrors.refreshTokenExpired();
    }
    if (!compareTokenHash(dto.refreshToken, row.tokenHash)) {
      throw AuthErrors.refreshTokenInvalid();
    }

    await this.refreshTokenRepository.deleteById(row.id);

    const user = await this.userService.findOne(row.userId);
    return this.issueTokens(user.id, user.email);
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessPayload: JwtPayload = { sub: userId, email };
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get('JWT_SECRET', { infer: true }),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', {
        infer: true,
      }),
    });

    const jti = randomUUID();
    const refreshPayload: RefreshTokenPayload = { sub: userId, jti };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', {
        infer: true,
      }),
    });

    // Decode (not verify — we just signed it, no need to re-check) to
    // pull the real `exp` claim rather than hand-parsing "7d" ourselves.
    const decoded = this.jwtService.decode<{ exp: number } | null>(
      refreshToken,
    );
    if (!decoded) {
      throw new Error('Failed to decode freshly-signed refresh token');
    }
    const expiresAt = new Date(decoded.exp * 1000);

    // Only a hash of the refresh token is stored — same "never store the
    // raw secret" rule as passwords, just with a fast hash instead of
    // bcrypt (see token-hasher.ts for why). A stolen refresh_tokens row
    // is useless without the raw token to hash-compare against.
    const tokenHash = hashToken(refreshToken);
    await this.refreshTokenRepository.create({
      id: jti,
      userId,
      tokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  // void-ok — this either returns silently or throws; no result to return.
  private async enforceLoginRateLimit(ip: string): Promise<void> {
    const key = `login-attempts:${ip}`;
    const attempts = await this.redis.incr(key);
    if (attempts === 1) {
      await this.redis.expire(key, LOGIN_RATE_LIMIT_WINDOW_SECONDS);
    }
    if (attempts > LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
      throw AuthErrors.tooManyAttempts();
    }
  }
}
