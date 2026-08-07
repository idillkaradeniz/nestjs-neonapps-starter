//fire-and-forget
import { Injectable, Logger } from '@nestjs/common';
import { AuditAction } from './audit-action.enum';
import { AuditRepository } from './audit.repository';
import { AuditQueryFilter } from './interfaces/audit-query-filter.interface';
import { AuditRow } from './interfaces/audit-row.type';

export interface LogChangeParams {
  action: AuditAction;
  entity: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  performedBy: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepository: AuditRepository) {}

  async logChange(params: LogChangeParams): Promise<void> {
    // void-ok — fire-and-forget target, caller never awaits this

    try {
      await this.auditRepository.create(params);
    } catch (err) {
      this.logger.warn(`Failed to write audit row: ${(err as Error).message}`);
    }
  }

  async list(
    filter: AuditQueryFilter,
    page: number,
    limit: number,
  ): Promise<AuditRow[]> {
    return this.auditRepository.findMany(filter, page, limit);
  }
}
