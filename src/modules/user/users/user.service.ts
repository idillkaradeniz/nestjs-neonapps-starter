import { requestContext } from '../../shared/common/context/request-context';
import { Injectable, Logger } from '@nestjs/common';
import { AuthErrors } from '../../auth/auth-errors.constant';
import { hashPassword } from '../../shared/common/utils/password-hasher';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUserRow } from './interfaces/public-user-row.type';
import { toPublicUser } from './interfaces/to-public-user';
import { UserRow } from './interfaces/user-row.type';
import { UserErrors } from './user-errors.constant';
import { UserRole } from './user-role.enum';
import { UserRepository } from './user.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventNames } from '../../shared/common/events/event-names.constant';
import { UserCreatedEvent } from './events/user-created.event';

// Service = business logic and orchestration. It never touches storage
// directly — it asks the repository (see _template/todo for the pattern
// this module follows). Every method returns PublicUserRow, never the
// raw UserRow — passwordHash must never leave this layer (see
// to-public-user.ts).
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}
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

    this.eventEmitter.emit(EventNames.USER_CREATED, {
      userId: user.id,
      email: user.email,
      name: user.name,
    } satisfies UserCreatedEvent);

    return toPublicUser(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUserRow> {
    const changes: Partial<Pick<UserRow, 'name' | 'email' | 'passwordHash'>> =
      {};
    if (dto.name !== undefined) changes.name = dto.name.trim();
    if (dto.email !== undefined) changes.email = dto.email.trim();
    if (dto.password !== undefined)
      changes.passwordHash = await hashPassword(dto.password);

    const before = await this.userRepository.findOne(id);
    if (!before) {
      throw UserErrors.notFound({ id });
    }
    const store = requestContext.getStore();
    if (store) store.auditBefore = toPublicUser(before);

    const updated = await this.userRepository.update(id, changes);
    if (!updated) {
      throw UserErrors.notFound({ id });
    }
    return toPublicUser(updated);
  }

  // Two business rules, enforced here (not in a guard) so no caller —
  // HTTP, a cron job, a CLI script — can bypass them:
  // 1. AUTH_CANNOT_CHANGE_OWN_ROLE — even an admin can't touch their own
  //    role, so an admin can never accidentally lock themselves out.
  // 2. USER_CANNOT_DEMOTE_LAST_ADMIN — if the target is the only active
  //    ADMIN left, refuse the demotion, or the system has zero admins.
  async updateRole(
    id: string,
    newRole: UserRole,
    actingUserId: string,
  ): Promise<PublicUserRow> {
    if (id === actingUserId) {
      throw AuthErrors.cannotChangeOwnRole();
    }

    const target = await this.userRepository.findOne(id);
    if (!target) {
      throw UserErrors.notFound({ id });
    }

    if (target.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await this.userRepository.countByRole(UserRole.ADMIN);
      if (adminCount <= 1) {
        throw UserErrors.cannotDemoteLastAdmin();
      }
    }

    const updated = await this.userRepository.updateRole(id, newRole);
    if (!updated) {
      throw UserErrors.notFound({ id });
    }
    this.logger.log(`Role changed: ${id} → ${newRole} (by ${actingUserId})`);
    return toPublicUser(updated);
  }

  // actingUserId is undefined until the auth flow is wired to this
  // controller (see @GetUser()). The rule is enforced here in the
  // Service — not the Controller — so that once auth lands, no caller
  // (HTTP, a cron job, a CLI script) can bypass it.
  // void-ok — soft delete has no meaningful result to return.
  async remove(id: string, actingUserId?: string): Promise<void> {
    // void-ok — soft delete has no meaningful result to return.
    if (actingUserId !== undefined && actingUserId === id) {
      throw UserErrors.cannotDeactivateSelf();
    }
    const before = await this.userRepository.findOne(id);
    if (!before) {
      throw UserErrors.notFound({ id });
    }
    const store = requestContext.getStore();
    if (store) store.auditBefore = toPublicUser(before);

    const removed = await this.userRepository.remove(id);
    if (!removed) {
      throw UserErrors.notFound({ id });
    }
  }

  // Day 12 cleanup cron: hard-deletes users soft-deleted more than `days`
  // days ago. Returns the count purely so the cron job can log a
  // meaningful line ("cleaned up N records") — no HTTP caller needs this.
  async purgeInactiveOlderThan(days: number): Promise<number> {
    return await this.userRepository.deleteInactiveOlderThan(days);
  }
}
