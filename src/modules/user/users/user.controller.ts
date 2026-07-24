import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserRow } from '../../shared/database/schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

// Controller = HTTP shape ONLY: route, params, body DTO, response type.
// No logic here — it translates HTTP into a service call
// (see _template/todo for the pattern this module follows).
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /users?page=1&limit=10
  @Get()
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<UserRow[]> {
    return this.userService.list(page, limit);
  }

  // GET /users/:id
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserRow> {
    return this.userService.findOne(id);
  }

  // POST /users  { "name": "...", "email": "..." }
  @Post()
  create(@Body() dto: CreateUserDto): Promise<UserRow> {
    return this.userService.create(dto);
  }

  // PATCH /users/:id  { "name": "..." } or { "email": "..." }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserRow> {
    return this.userService.update(id, dto);
  }

  // DELETE /users/:id (soft delete — flips isActive to false)
  @Delete(':id')
  // void-ok — soft delete has no meaningful result to return.
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
