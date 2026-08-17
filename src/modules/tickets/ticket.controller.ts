import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../shared/common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../shared/common/decorators/api-success-response.decorator';
import { ApiErrorCodes } from '../shared/common/decorators/api-error-codes.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AuthErrorCode, TicketErrorCode, AiErrorCode } from '../shared/common/enums';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { TicketCommentResponseDto } from './dto/ticket-comment-response.dto';
import { TicketRow } from './interfaces/ticket-row.type';
import { TicketCommentRow } from './interfaces/ticket-comment-row.type';
import { TicketAiSummaryResponseDto } from './dto/ticket-ai-summary-response.dto';
import { PaginationQueryDto } from '../shared/common/dto/pagination-query.dto';

@ApiBearerAuth()
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiSuccessResponse(TicketResponseDto, { status: 201 })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    TicketErrorCode.OPEN_LIMIT_EXCEEDED,
  )
  async create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketRow> {
    return this.ticketService.create(dto, user.id);
  }

  @Get()
  @ApiSuccessResponse(TicketResponseDto, { isArray: true })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
  )
  async findAll(
  @Query() pagination: PaginationQueryDto,
  @Query('createdBy') createdBy?: string,
  @Query('assignedTo') assignedTo?: string,
): Promise<TicketRow[]> {
  return this.ticketService.findAll({ createdBy, assignedTo }, pagination.page, pagination.limit);
}

  @Get(':id')
  @ApiSuccessResponse(TicketResponseDto)
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    TicketErrorCode.NOT_FOUND,
  )
  async findOne(@Param('id') id: string): Promise<TicketRow> {
    return this.ticketService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(TicketResponseDto)
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    TicketErrorCode.NOT_FOUND,
    TicketErrorCode.ALREADY_CLOSED,
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<TicketRow> {
    return this.ticketService.update(id, dto);
  }

  @Patch(':id/assign')
  @ApiSuccessResponse(TicketResponseDto)
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    TicketErrorCode.NOT_FOUND,
    TicketErrorCode.ALREADY_CLOSED,
  )
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
  ): Promise<TicketRow> {
    return this.ticketService.assign(id, dto);
  }

  @Patch(':id/close')
  @ApiSuccessResponse(TicketResponseDto)
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    TicketErrorCode.NOT_FOUND,
    TicketErrorCode.ALREADY_CLOSED,
    TicketErrorCode.NOT_ASSIGNED_TO_YOU,
  )
  async close(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketRow> {
    return this.ticketService.close(id, user.id);
  }

  @Post(':id/comments')
  @ApiSuccessResponse(TicketCommentResponseDto, { status: 201 })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    TicketErrorCode.NOT_FOUND,
    TicketErrorCode.ALREADY_CLOSED,
  )
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateTicketCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketCommentRow> {
    return this.ticketService.addComment(id, dto, user.id);
  }

  @Get(':id/comments')
  @ApiSuccessResponse(TicketCommentResponseDto, { isArray: true })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    TicketErrorCode.NOT_FOUND,
  )
  async listComments(
  @Param('id') id: string,
  @Query() pagination: PaginationQueryDto,
): Promise<TicketCommentRow[]> {
  return this.ticketService.listComments(id, pagination.page, pagination.limit);
}

  @Post(':id/ai-summary')
  @ApiSuccessResponse(TicketAiSummaryResponseDto)
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    TicketErrorCode.NOT_FOUND,
    AiErrorCode.PROVIDER_UNAVAILABLE,
  )
  async summarize(
    @Param('id') id: string,
  ): Promise<{ summary: string; tags: string[] }> {
    return this.ticketService.summarize(id);
  }
}
