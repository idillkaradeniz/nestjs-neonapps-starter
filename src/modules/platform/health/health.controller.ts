import { Controller, Get } from '@nestjs/common';
import { HealthStatus } from './interfaces/health-status.interface';

// GET /health — the simplest possible endpoint. Load balancers and uptime
// monitors call this to check the process is alive.
@Controller('health')
export class HealthController {
  @Get()
  check(): HealthStatus {
    return { status: 'ok', uptime: process.uptime() };
  }
}
