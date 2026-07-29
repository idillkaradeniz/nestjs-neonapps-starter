import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

// The module declares what this feature is made of.
// Follows the _template/todo layout: controller -> service -> repository.
@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  // Exported so AuthModule can reuse UserService.create() for register()
  // (same "create a user" logic, no duplicated hashing/validation) and
  // UserRepository.findByEmail() for login() (needs the raw passwordHash,
  // which UserService deliberately never returns — see PublicUserRow).
  exports: [UserService, UserRepository],
})
export class UsersModule {}
