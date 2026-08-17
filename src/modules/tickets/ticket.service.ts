import { Inject, Injectable } from "@nestjs/common";
import { TicketRepository } from "./ticket.repository";
import { TicketCommentRepository } from "./ticket-comment.repository";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { AssignTicketDto } from "./dto/assign-ticket.dto";
import { CreateTicketCommentDto } from "./dto/create-ticket-comment.dto";
import { TicketErrors } from "./ticket-errors.constant";
import { TicketStatus } from '../shared/common/enums';
import { TicketRow } from "./interfaces/ticket-row.type";
import { TicketCommentRow } from "./interfaces/ticket-comment-row.type";
import { TicketsGateway } from "./tickets.gateway";
import { AI_PROVIDER } from "../shared/ai/ai-provider.token";
import { AiAdapter } from "../shared/ai/ai-adapter.interface";
import { AiErrors } from "../shared/ai/ai-errors.constant";

const MAX_OPEN_TICKETS_PER_USER = 5;

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly ticketCommentRepository: TicketCommentRepository,
    private readonly ticketsGateway: TicketsGateway,
    @Inject(AI_PROVIDER) private readonly aiAdapter: AiAdapter,
  ) {}

  async create(dto: CreateTicketDto, userId: string): Promise<TicketRow> {
    const openCount = await this.ticketRepository.countOpenByUser(userId);
    if (openCount >= MAX_OPEN_TICKETS_PER_USER) {
      throw TicketErrors.openLimitExceeded({ limit: MAX_OPEN_TICKETS_PER_USER });
    }

    return await this.ticketRepository.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      priority: dto.priority ?? "MEDIUM",
      createdBy: userId,
    });
  }

  async findOne(id: string): Promise<TicketRow> {
    const ticket = await this.ticketRepository.findOne(id);
    if (!ticket) {
      throw TicketErrors.notFound({ id });
    }
    return ticket;
  }

  async findAll(
    filters: { createdBy?: string; assignedTo?: string },
    page: number,
    limit: number,
  ): Promise<TicketRow[]> {
    return this.ticketRepository.findAll(filters, page, limit);
  }

  async update(id: string, dto: UpdateTicketDto): Promise<TicketRow> {
    const ticket = await this.findOne(id);
    if (ticket.status === TicketStatus.CLOSED) {
      throw TicketErrors.alreadyClosed({ id });
    }

    const updated = await this.ticketRepository.update(id, dto);
    if (!updated) {
      throw TicketErrors.notFound({ id });
    }
    return updated;
  }

  async assign(id: string, dto: AssignTicketDto): Promise<TicketRow> {
    const ticket = await this.findOne(id);
    if (ticket.status === TicketStatus.CLOSED) {
      throw TicketErrors.alreadyClosed({ id });
    }

    const updated = await this.ticketRepository.update(id, {
      assignedTo: dto.assignedTo,
      status: TicketStatus.IN_PROGRESS,
    });
    if (!updated) {
      throw TicketErrors.notFound({ id });
    }
    this.ticketsGateway.broadcastStatusChanged(id, updated);
    return updated;
  }

  async close(id: string, userId: string): Promise<TicketRow> {
    const ticket = await this.findOne(id);
    if (ticket.status === TicketStatus.CLOSED) {
      throw TicketErrors.alreadyClosed({ id });
    }
    if (ticket.assignedTo !== userId) {
      throw TicketErrors.notAssignedToYou({ id });
    }

    const updated = await this.ticketRepository.update(id, {
      status: TicketStatus.CLOSED,
      closedAt: new Date(),
    });
    if (!updated) {
      throw TicketErrors.notFound({ id });
    }
    this.ticketsGateway.broadcastStatusChanged(id, updated);
    return updated;
  }

  async addComment(
    ticketId: string,
    dto: CreateTicketCommentDto,
    authorId: string,
  ): Promise<TicketCommentRow> {
    const ticket = await this.findOne(ticketId);
    if (ticket.status === TicketStatus.CLOSED) {
      throw TicketErrors.alreadyClosed({ id: ticketId });
    }

    const comment = await this.ticketCommentRepository.create({
      ticketId,
      authorId,
      body: dto.body.trim(),
    });
    this.ticketsGateway.broadcastNewComment(ticketId, comment); // ← eklendi
    return comment;
  }

  async listComments(ticketId: string, page: number, limit: number): Promise<TicketCommentRow[]> {
    await this.findOne(ticketId);
    return this.ticketCommentRepository.findAllByTicketId(ticketId, page, limit);
  }

  async summarize(ticketId: string): Promise<{ summary: string; tags: string[] }> {
    const ticket = await this.findOne(ticketId);
    const comments = await this.ticketCommentRepository.findAllByTicketId(ticketId, 1, 1000);
    const fullText = [ticket.title, ticket.description, ...comments.map((c) => c.body)].join("\n");

    try {
      const [summary, tags] = await Promise.all([
        this.aiAdapter.summarize(fullText),
        this.aiAdapter.generateTags(fullText),
      ]);
      return { summary, tags };
    } catch (error) {
      console.error("AI provider error:", error);
      throw AiErrors.providerUnavailable();
    }
  }
}
