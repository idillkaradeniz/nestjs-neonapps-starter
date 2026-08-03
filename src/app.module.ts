import { SentryModule } from '@sentry/nestjs/setup';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { Env } from './modules/shared/config/env.schema';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TodosModule } from './modules/_template/todo/todos.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/platform/health/health.module';
import { validateEnv } from './modules/shared/config/env.schema';
import { DatabaseModule } from './modules/shared/database/database.module';
import { RedisModule } from './modules/shared/redis/redis.module';
import { TeamModule } from './modules/user/team/team.module';
import { UsersModule } from './modules/user/users/users.module';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RequestContextMiddleware } from './modules/shared/common/context/request-context.middleware';
import { requestContext } from './modules/shared/common/context/request-context';

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
    DatabaseModule,
    RedisModule,
    HealthModule,
    TodosModule,
    TeamModule,
    UsersModule,
    // Registers JwtAuthGuard globally (APP_GUARD) — must be imported for
    // that provider to take effect app-wide. Everything is protected by
    // default from this point on; see @Public() for the opt-out.
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
