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
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<UserRow[]> {
    return await this.userService.list(page, limit);
  }

  // GET /users/:id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserRow> {
    return await this.userService.findOne(id);
  }

  // POST /users  { "name": "...", "email": "..." }
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserRow> {
    return await this.userService.create(dto);
  }

  // PATCH /users/:id  { "name": "..." } or { "email": "..." }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserRow> {
    return await this.userService.update(id, dto);
  }

  // DELETE /users/:id (soft delete — flips isActive to false)
  @Delete(':id')
  // void-ok — soft delete has no meaningful result to return.
  async remove(@Param('id') id: string): Promise<void> {
    return await this.userService.remove(id);
  }
}
