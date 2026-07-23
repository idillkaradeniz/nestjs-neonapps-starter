import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TodosModule } from './modules/_template/todo/todos.module';
import { HealthModule } from './modules/platform/health/health.module';
import { TeamModule } from './modules/user/team/team.module';
import { UsersModule } from './modules/user/users/users.module';
// Root module: only wires other modules together — no logic of its own.
@Module({
  imports: [
    // isGlobal makes ConfigService injectable everywhere without re-importing.
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    TodosModule,
    TeamModule,
    UsersModule,
  ],
})
export class AppModule {}
