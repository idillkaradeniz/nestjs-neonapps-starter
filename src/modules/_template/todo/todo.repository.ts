import { Injectable } from '@nestjs/common';
import { Todo } from './interfaces/todo.interface';

// Repository = the ONLY layer that touches storage.
// Today "storage" is an in-memory array. On Day 13 you will swap this file
// for one backed by a real database (Drizzle + Postgres) WITHOUT touching
// the service or the controller — that is the whole point of the layering.
// (The lint guard `lint:no-db-in-service` enforces it: DB tokens may only
// ever appear in *.repository.ts files, never in *.service.ts.)
@Injectable()
export class TodoRepository {
  private readonly todos: Todo[] = [];
  private nextId = 1;

  findAll(): Todo[] {
    return this.todos;
  }

  create(title: string): Todo {
    const todo: Todo = { id: this.nextId++, title, done: false };
    this.todos.push(todo);
    return todo;
  }
}
