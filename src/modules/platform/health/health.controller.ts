import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { Public } from '../../shared/common/decorators/public.decorator';
import { RawResponse } from '../../shared/common/decorators/raw-response.decorator';
import { HealthStatus } from './interfaces/health-status.interface';

// GET /health — the simplest possible endpoint. Load balancers and uptime
// monitors call this to check the process is alive. @RawResponse() keeps
// the shape exactly { status, uptime } — no { success, data } wrapper —
// since infra tooling expects this exact contract, not our API's shape.
// @Public() is required too — JwtAuthGuard is global (Day 7), so
// without it this would demand a token just to check liveness.
export
@Controller({ path: 'health', version: VERSION_NEUTRAL })
class HealthController {
  @Get()
  @Public()
  @RawResponse()
  check(): HealthStatus {
    return { status: 'ok', uptime: process.uptime() };
  }
  // TEMPORARY — Day 9 Sentry verification. Deliberately throws so we can
  // confirm the 5xx → Sentry mirror in http-exception.filter.ts actually
  // works. Remove (or keep behind a flag) once verified.
  @Get('debug-sentry')
  @Public()
  triggerError(): never {
    throw new Error('Day 9 test error — Sentry verification');
  }
}
