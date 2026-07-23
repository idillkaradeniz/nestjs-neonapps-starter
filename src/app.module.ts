import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TodosModule } from './modules/_template/todo/todos.module';
import { HealthModule } from './modules/platform/health/health.module';
import { validateEnv } from './modules/shared/config/env.schema';
import { TeamModule } from './modules/user/team/team.module';
import { UsersModule } from './modules/user/users/users.module';
// Root module: only wires other modules together — no logic of its own.
@Module({
  imports: [
    // isGlobal makes ConfigService injectable everywhere without re-importing.
    // validate runs the Zod schema against process.env at startup — if a
    // required variable is missing, this throws and the app refuses to boot.
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    HealthModule,
    TodosModule,
    TeamModule,
    UsersModule,
  ],
})
export class AppModule {}
