import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRow } from '../../shared/database/schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

// Service = business logic and orchestration. It never touches storage
// directly — it asks the repository (see _template/todo for the pattern
// this module follows).
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async list(page: number, limit: number): Promise<UserRow[]> {
    return await this.userRepository.findAll(page, limit);
  }

  async findOne(id: string): Promise<UserRow> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<UserRow> {
    return await this.userRepository.create({
      name: dto.name.trim(),
      email: dto.email.trim(),
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserRow> {
    const changes: Partial<Pick<UserRow, 'name' | 'email'>> = {};
    if (dto.name !== undefined) changes.name = dto.name.trim();
    if (dto.email !== undefined) changes.email = dto.email.trim();

    const updated = await this.userRepository.update(id, changes);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return updated;
  }

  // void-ok — soft delete has no meaningful result to return.
  async remove(id: string): Promise<void> {
    const removed = await this.userRepository.remove(id);
    if (!removed) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
