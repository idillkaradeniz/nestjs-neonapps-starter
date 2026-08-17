import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Env } from '../shared/config/env.schema';
import { comparePassword } from '../shared/common/utils/password-hasher';
import {
  compareTokenHash,
  hashToken,
} from '../shared/common/utils/token-hasher';
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
import { UserRole } from  '../shared/common/enums';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const user = await this.userService.create(dto);
    this.logger.log(`User registered: ${user.email}`);
    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const email = dto.email.trim();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warn(`Failed login attempt for unknown email: ${email}`);
      throw AuthErrors.invalidCredentials();
    }
    const passwordMatches = await comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      this.logger.warn(`Failed login attempt (wrong password): ${email}`);
      throw AuthErrors.invalidCredentials();
    }
    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokens> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(dto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      });
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
    return this.issueTokens(user.id, user.email, user.role);
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<AuthTokens> {
    const accessPayload: JwtPayload = { sub: userId, email, role };
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

    const decoded = this.jwtService.decode<{ exp: number } | null>(
      refreshToken,
    );
    if (!decoded) {
      throw new Error('Failed to decode freshly-signed refresh token');
    }
    const expiresAt = new Date(decoded.exp * 1000);

    const tokenHash = hashToken(refreshToken);
    await this.refreshTokenRepository.create({
      id: jti,
      userId,
      tokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}
