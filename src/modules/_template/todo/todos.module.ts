import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoRepository } from './todo.repository';
import { TodoService } from './todo.service';

// The module declares what this feature is made of. Everything the
// feature needs is listed here; nothing leaks out unless exported.
// This folder (_template/todo) is the reference layout for every module
// you will build: controller -> service -> repository, one class per file.
@Module({
  controllers: [TodoController],
  providers: [TodoService, TodoRepository],
})
export class TodosModule {}
