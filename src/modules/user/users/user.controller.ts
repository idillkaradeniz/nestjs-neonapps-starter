import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PublicUserRow } from './interfaces/public-user-row.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

// Controller = HTTP shape ONLY: route, params, body DTO, response type.
// No logic here — it translates HTTP into a service call
// (see _template/todo for the pattern this module follows).
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async list(@Query() query: PaginationQueryDto): Promise<PublicUserRow[]> {
    return await this.userService.list(query.page, query.limit);
  }

  // GET /users/:id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PublicUserRow> {
    return await this.userService.findOne(id);
  }

  // POST /users  { "name": "...", "email": "..." }
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<PublicUserRow> {
    return await this.userService.create(dto);
  }

  // PATCH /users/:id  { "name": "..." } or { "email": "..." }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<PublicUserRow> {
    return await this.userService.update(id, dto);
  }

  // DELETE /users/:id (soft delete — flips isActive to false)
  // Protected by the global JwtAuthGuard (Day 7) — @CurrentUser() is now
  // real, so the self-deactivation check in UserService.remove() is
  // finally reachable instead of always seeing actingUserId=undefined.
  @Delete(':id')
  // void-ok — soft delete has no meaningful result to return.
  async remove(
    @Param('id') id: string,
    @CurrentUser() actingUser: AuthenticatedUser,
  ): Promise<void> {
    return await this.userService.remove(id, actingUser.id);
  }
}
