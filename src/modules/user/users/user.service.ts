import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './interfaces/user.interface';
import { UserRepository } from './user.repository';

// Service = business logic and orchestration. It never touches storage
// directly — it asks the repository (see _template/todo for the pattern
// this module follows).
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  list(): User[] {
    return this.userRepository.findAll();
  }

  findOne(id: number): User {
    const user = this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  create(dto: CreateUserDto): User {
    return this.userRepository.create(dto.name.trim(), dto.email.trim());
  }

  update(id: number, dto: UpdateUserDto): User {
    const changes: Partial<Pick<User, 'name' | 'email'>> = {};
    if (dto.name !== undefined) changes.name = dto.name.trim();
    if (dto.email !== undefined) changes.email = dto.email.trim();

    const updated = this.userRepository.update(id, changes);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return updated;
  }

  remove(id: number): void {
    const removed = this.userRepository.remove(id);
    if (!removed) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
