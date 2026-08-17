import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../shared/common/decorators/api-success-response.decorator';
import { ApiErrorCodes } from '../../shared/common/decorators/api-error-codes.decorator';
import { AuthErrorCode } from '../../shared/common/enums';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoResponseDto } from './dto/todo-response.dto';
import { Todo } from './interfaces/todo.interface';
import { TodoService } from './todo.service';

// Not @Public() — sits behind the global JwtAuthGuard.
@ApiBearerAuth()
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiSuccessResponse(TodoResponseDto, { isArray: true })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
  )
  list(): Todo[] {
    return this.todoService.list();
  }

  @Post()
  @ApiSuccessResponse(TodoResponseDto, { status: 201 })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
  )
  create(@Body() dto: CreateTodoDto): Todo {
    return this.todoService.create(dto);
  }
}
