import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { CurrentUser } from '../shared/common/decorators/current-user.decorator';
import { Public } from '../shared/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { AuthTokens } from './interfaces/auth-tokens.interface';

// Controller = HTTP shape only, same rule as UserController. Every
// route here is @Public() ON PURPOSE — a conscious opt-out of the
// global JwtAuthGuard, since you can't present a token to get your
// first token. /me is the one exception: it stays behind the guard,
// specifically to prove @CurrentUser() + the guard actually work.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register  { "name": "...", "email": "...", "password": "..." }
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthTokens> {
    return await this.authService.register(dto);
  }

  // POST /auth/login  { "email": "...", "password": "..." }
  // Stricter than the global 100/min default (Day 10) — login is a
  // brute-force target, gets its own tighter override.
  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  async login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return await this.authService.login(dto);
  }

  // POST /auth/refresh  { "refreshToken": "..." }
  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return await this.authService.refresh(dto);
  }

  // GET /auth/me — NOT @Public(). Protected by the global JwtAuthGuard;
  // exists to verify the whole chain: token → guard → JwtStrategy →
  // @CurrentUser() → here.
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
