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
import { RequirePermission } from '../../shared/common/decorators/require-permission.decorator';
import { PaginationQueryDto } from '../../shared/common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { Permission } from '../../auth/permission.enum';
import { PublicUserRow } from './interfaces/public-user-row.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserService } from './user.service';

// Controller = HTTP shape ONLY: route, params, body DTO, response type.
// No logic here — it translates HTTP into a service call
// (see _template/todo for the pattern this module follows).
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Permission-based, not role-based: any role whose ROLE_PERMISSIONS
  // entry includes USER_READ can list users — currently ADMIN and
  // MODERATOR, not plain USER.
  @RequirePermission(Permission.USER_READ)
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

  // PATCH /users/:id/role  { "role": "ADMIN" | "USER" | "MODERATOR" }
  // Only roles with USER_MANAGE_ROLES (currently just ADMIN) can reach
  // this. Business rules (can't change your own role, can't demote the
  // last ADMIN) are enforced in UserService.updateRole(), not here.
  @RequirePermission(Permission.USER_MANAGE_ROLES)
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() actingUser: AuthenticatedUser,
  ): Promise<PublicUserRow> {
    return await this.userService.updateRole(id, dto.role, actingUser.id);
  }

  // DELETE /users/:id (soft delete — flips isActive to false)
  // Only roles with USER_DELETE (currently just ADMIN) can reach this.
  @RequirePermission(Permission.USER_DELETE)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() actingUser: AuthenticatedUser,
  ): Promise<void> {
    // void-ok — soft delete has no meaningful result to return.
    return await this.userService.remove(id, actingUser.id);
  }
}
