import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './interfaces/todo.interface';
import { TodoService } from './todo.service';

// Controller = HTTP shape ONLY: route, params, body DTO, response type.
// There is deliberately NO logic here — no if/else, no loops, no storage.
// It translates HTTP into a service call and returns the result. If you
// find yourself writing business rules in a controller, move them to the
// service. Validation already happened (global ValidationPipe + the DTO)
// by the time create() runs.
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  // GET /todos
  @Get()
  list(): Todo[] {
    return this.todoService.list();
  }

  // POST /todos  { "title": "learn nest" }
  @Post()
  create(@Body() dto: CreateTodoDto): Todo {
    return this.todoService.create(dto);
  }
}
