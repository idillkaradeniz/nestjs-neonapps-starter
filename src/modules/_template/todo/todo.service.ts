import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './interfaces/todo.interface';
import { TodoRepository } from './todo.repository';

// Service = business logic and orchestration. Two hard rules:
//   1. It NEVER touches storage directly — it asks the repository.
//      That keeps business rules testable without a database.
//   2. It never builds HTTP responses — it returns domain objects and
//      throws typed exceptions; HTTP shape is the controller's job.
// Nest injects TodoRepository through the constructor (dependency
// injection): this class never does `new TodoRepository()` itself.
@Injectable()
export class TodoService {
  constructor(private readonly todoRepository: TodoRepository) {}

  list(): Todo[] {
    return this.todoRepository.findAll();
  }

  create(dto: CreateTodoDto): Todo {
    // Business rules live HERE, between the validated input and storage.
    // (Example rule: normalize the title before persisting it.)
    return this.todoRepository.create(dto.title.trim());
  }
}
