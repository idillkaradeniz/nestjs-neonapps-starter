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
import { ApiSuccessResponse } from '../../shared/common/decorators/api-success-response.decorator';
import { ApiErrorCodes } from '../../shared/common/decorators/api-error-codes.decorator';
import { PublicUserResponseDto } from './dto/public-user-response.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthErrorCode } from '../../auth/auth-error-code.enum';
import { UserErrorCode } from './user-error-code.enum';

// Controller = HTTP shape ONLY: route, params, body DTO, response type.
// No logic here — it translates HTTP into a service call
// (see _template/todo for the pattern this module follows).
// No route here is @Public() — every one sits behind the global
// JwtAuthGuard, hence @ApiBearerAuth() at the class level.
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Permission-based, not role-based: any role whose ROLE_PERMISSIONS
  // entry includes USER_READ can list users — currently ADMIN and
  // MODERATOR, not plain USER.
  @RequirePermission(Permission.USER_READ)
  @Get()
  @ApiSuccessResponse(PublicUserResponseDto, { isArray: true })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    AuthErrorCode.FORBIDDEN_PERMISSION,
  )
  async list(@Query() query: PaginationQueryDto): Promise<PublicUserRow[]> {
    return await this.userService.list(query.page, query.limit);
  }

  @Get(':id')
  @ApiSuccessResponse(PublicUserResponseDto)
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    UserErrorCode.NOT_FOUND,
  )
  async findOne(@Param('id') id: string): Promise<PublicUserRow> {
    return await this.userService.findOne(id);
  }

  @Post()
  @ApiSuccessResponse(PublicUserResponseDto, { status: 201 })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    UserErrorCode.EMAIL_ALREADY_EXISTS,
  )
  async create(@Body() dto: CreateUserDto): Promise<PublicUserRow> {
    return await this.userService.create(dto);
  }

  @Patch(':id')
  @ApiSuccessResponse(PublicUserResponseDto)
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    UserErrorCode.NOT_FOUND,
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<PublicUserRow> {
    return await this.userService.update(id, dto);
  }

  @RequirePermission(Permission.USER_MANAGE_ROLES)
  @Patch(':id/role')
  @ApiSuccessResponse(PublicUserResponseDto)
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    AuthErrorCode.FORBIDDEN_PERMISSION,
    AuthErrorCode.CANNOT_CHANGE_OWN_ROLE,
    UserErrorCode.NOT_FOUND,
    UserErrorCode.CANNOT_DEMOTE_LAST_ADMIN,
  )
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() actingUser: AuthenticatedUser,
  ): Promise<PublicUserRow> {
    return await this.userService.updateRole(id, dto.role, actingUser.id);
  }

  @RequirePermission(Permission.USER_DELETE)
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'User soft-deleted' })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    AuthErrorCode.FORBIDDEN_PERMISSION,
    UserErrorCode.CANNOT_DEACTIVATE_SELF,
    UserErrorCode.NOT_FOUND,
  )
  async remove(
    @Param('id') id: string,
    @CurrentUser() actingUser: AuthenticatedUser,
  ): Promise<void> {
    // void-ok — soft delete has no meaningful result to return.
    return await this.userService.remove(id, actingUser.id);
  }
}
