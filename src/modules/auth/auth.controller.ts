import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Throttle, seconds } from '@nestjs/throttler';
import { CurrentUser } from '../shared/common/decorators/current-user.decorator';
import { Public } from '../shared/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { AuthTokens } from './interfaces/auth-tokens.interface';
import { ApiSuccessResponse } from '../shared/common/decorators/api-success-response.decorator';
import { ApiErrorCodes } from '../shared/common/decorators/api-error-codes.decorator';
import { AuthenticatedUserResponseDto } from './dto/authenticated-user-response.dto';
import { AuthTokensResponseDto } from './dto/auth-tokens-response.dto';
import { AuthErrorCode } from './auth-error-code.enum';
import { UserErrorCode } from '../user/users/user-error-code.enum';

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
  @ApiSuccessResponse(AuthTokensResponseDto, { status: 201 })
  @ApiErrorCodes(UserErrorCode.EMAIL_ALREADY_EXISTS)
  async register(@Body() dto: RegisterDto): Promise<AuthTokens> {
    return await this.authService.register(dto);
  }
  // POST /auth/login  { "email": "...", "password": "..." }
  // Stricter than the global 100/min default (Day 10) — login is a
  // brute-force target, gets its own tighter override.
  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiSuccessResponse(AuthTokensResponseDto, { status: 201 })
  @ApiErrorCodes(AuthErrorCode.INVALID_CREDENTIALS)
  // RATE_LIMIT_EXCEEDED isn't in ERROR_REGISTRY (thrown directly by
  // AppThrottlerGuard, not a domain error) — documented by hand.
  @ApiResponse({
    status: 429,
    description: '**RATE_LIMIT_EXCEEDED** — Too many requests, try again later',
  })
  async login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return await this.authService.login(dto);
  }

  // POST /auth/refresh  { "refreshToken": "..." }
  @Public()
  @Post('refresh')
  @ApiSuccessResponse(AuthTokensResponseDto, { status: 201 })
  @ApiErrorCodes(
    AuthErrorCode.REFRESH_TOKEN_INVALID,
    AuthErrorCode.REFRESH_TOKEN_EXPIRED,
  )
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return await this.authService.refresh(dto);
  }
  // GET /auth/me — NOT @Public(). Protected by the global JwtAuthGuard;
  // exists to verify the whole chain: token → guard → JwtStrategy →
  // @CurrentUser() → here.
  @Get('me')
  @ApiBearerAuth()
  @ApiSuccessResponse(AuthenticatedUserResponseDto)
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
  )
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
