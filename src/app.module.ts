import { SchedulerModule } from './modules/platform/scheduler/scheduler.module';
import { AuditModule } from './modules/platform/audit/audit.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { Env } from './modules/shared/config/env.schema';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { AppThrottlerGuard } from './modules/shared/common/guards/throttler.guard';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { TodosModule } from './modules/_template/todo/todos.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/platform/health/health.module';
import { validateEnv } from './modules/shared/config/env.schema';
import { DatabaseModule } from './modules/shared/database/database.module';
import { RedisModule } from './modules/shared/redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TeamModule } from './modules/user/team/team.module';
import { UsersModule } from './modules/user/users/users.module';
import { RequestContextMiddleware } from './modules/shared/common/context/request-context.middleware';
import { requestContext } from './modules/shared/common/context/request-context';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from './modules/platform/notifications/notifications.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { BullModule } from '@nestjs/bullmq';

// Root module: only wires other modules together — no logic of its own.
@Module({
  imports: [
    SentryModule.forRoot(),
    // isGlobal makes ConfigService injectable everywhere without re-importing.
    // validate runs the Zod schema against process.env at startup — if a
    // required variable is missing, this throws and the app refuses to boot.
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Pino-backed structured logging (Day 9). Pretty-printed in dev
    // (NODE_ENV=development), raw JSON in prod — see main.ts for how
    // this replaces Nest's built-in Logger app-wide.
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => {
        const isDev =
          configService.get('NODE_ENV', { infer: true }) === 'development';
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            // AsyncLocalStorage-backed request context (Day 9 bonus) —
            // attaches requestId/userId to every log line automatically.
            customProps: () => requestContext.getStore() ?? {},
            transport: isDev
              ? {
                  target: 'pino-pretty',
                  options: { colorize: true, singleLine: true },
                }
              : undefined,
          },
        };
      },
    }),
    // Redis-backed rate limiting (Day 10). One global 100/min throttler;
    // routes can override with @Throttle({ default: {...} }) for stricter
    // limits (see AuthController.login).
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => ({
        throttlers: [{ name: 'default', ttl: seconds(60), limit: 100 }],
        storage: new ThrottlerStorageRedisService(
          configService.get('REDIS_URL', { infer: true }),
        ),
      }),
    }),

    BullModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService<Env, true>) => ({
    connection: {
      url: configService.get('REDIS_URL', { infer: true }),
    },
  }),
}),
    DatabaseModule,
    RedisModule,
    ScheduleModule.forRoot(),
    HealthModule,
    SchedulerModule,
    AuditModule,
    UploadsModule,
    NotificationsModule,
    EventEmitterModule.forRoot(),
    TodosModule,
    TeamModule,
    UsersModule,
    // Registers JwtAuthGuard globally (APP_GUARD) — must be imported for
    // that provider to take effect app-wide. Everything is protected by
    // default from this point on; see @Public() for the opt-out.
    AuthModule,
  ],
  providers: [
    // Registers ThrottlerGuard globally — every route is rate-limited by
    // default, same fail-closed pattern as JwtAuthGuard.
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  // Applies RequestContextMiddleware (Day 9) to every route, before
  // guards run — see request-context.middleware.ts.
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
