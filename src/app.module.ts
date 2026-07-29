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
// Root module: only wires other modules together — no logic of its own.
@Module({
  imports: [
    // isGlobal makes ConfigService injectable everywhere without re-importing.
    // validate runs the Zod schema against process.env at startup — if a
    // required variable is missing, this throws and the app refuses to boot.
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
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
export class AppModule {}
