import { Injectable } from '@nestjs/common';
import { hashPassword } from '../../shared/common/utils/password-hasher';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUserRow } from './interfaces/public-user-row.type';
import { toPublicUser } from './interfaces/to-public-user';
import { UserRow } from './interfaces/user-row.type';
import { UserRepository } from './user.repository';
import { UserErrors } from './user-errors.constant';
// Service = business logic and orchestration. It never touches storage
// directly — it asks the repository (see _template/todo for the pattern
// this module follows). Every method returns PublicUserRow, never the
// raw UserRow — passwordHash must never leave this layer (see
// to-public-user.ts).
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async list(page: number, limit: number): Promise<PublicUserRow[]> {
    const users = await this.userRepository.findAll(page, limit);
    return users.map(toPublicUser);
  }

  async findOne(id: string): Promise<PublicUserRow> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw UserErrors.notFound({ id });
    }
    return toPublicUser(user);
  }

  async create(dto: CreateUserDto): Promise<PublicUserRow> {
    const email = dto.email.trim();
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw UserErrors.emailAlreadyExists({ email });
    }
    const passwordHash = await hashPassword(dto.password);
    const user = await this.userRepository.create({
      name: dto.name.trim(),
      email,
      passwordHash,
    });
    return toPublicUser(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUserRow> {
    const changes: Partial<Pick<UserRow, 'name' | 'email'>> = {};
    if (dto.name !== undefined) changes.name = dto.name.trim();
    if (dto.email !== undefined) changes.email = dto.email.trim();

    const updated = await this.userRepository.update(id, changes);
    if (!updated) {
      throw UserErrors.notFound({ id });
    }
    return toPublicUser(updated);
  }

  // actingUserId is undefined until the auth flow is wired to this
  // controller (see @GetUser()). The rule is enforced here in the
  // Service — not the Controller — so that once auth lands, no caller
  // (HTTP, a cron job, a CLI script) can bypass it.
  // void-ok — soft delete has no meaningful result to return.
  async remove(id: string, actingUserId?: string): Promise<void> {
    if (actingUserId !== undefined && actingUserId === id) {
      throw UserErrors.cannotDeactivateSelf();
    }
    const removed = await this.userRepository.remove(id);
    if (!removed) {
      throw UserErrors.notFound({ id });
    }
  }
}
