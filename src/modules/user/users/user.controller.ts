import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './interfaces/user.interface';
import { UserService } from './user.service';

// Controller = HTTP shape ONLY: route, params, body DTO, response type.
// No logic here — it translates HTTP into a service call
// (see _template/todo for the pattern this module follows).
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /users
  @Get()
  list(): User[] {
    return this.userService.list();
  }

  // GET /users/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): User {
    return this.userService.findOne(id);
  }

  // POST /users  { "name": "...", "email": "..." }
  @Post()
  create(@Body() dto: CreateUserDto): User {
    return this.userService.create(dto);
  }

  // PATCH /users/:id  { "name": "..." } or { "email": "..." }
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): User {
    return this.userService.update(id, dto);
  }

  // DELETE /users/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.userService.remove(id);
  }
}
