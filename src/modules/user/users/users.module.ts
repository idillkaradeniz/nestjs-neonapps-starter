import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

// The module declares what this feature is made of.
// Follows the _template/todo layout: controller -> service -> repository.
@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UsersModule {}
