import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';

// Repository = the ONLY layer that touches storage.
// Today "storage" is an in-memory array. On Day 13 this will be
// replaced by a real database, without touching the service or
// controller (see _template/todo for the pattern this module follows).
@Injectable()
export class UserRepository {
  private readonly users: User[] = [];
  private nextId = 1;

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(name: string, email: string): User {
    const user: User = { id: this.nextId++, name, email };
    this.users.push(user);
    return user;
  }

  update(
    id: number,
    changes: Partial<Pick<User, 'name' | 'email'>>,
  ): User | undefined {
    const user = this.findOne(id);
    if (!user) return undefined;
    Object.assign(user, changes);
    return user;
  }

  remove(id: number): boolean {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}
