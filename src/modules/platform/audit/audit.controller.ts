import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from '../../auth/permission.enum';
import { RequirePermission } from '../../shared/common/decorators/require-permission.decorator';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuditRow } from './interfaces/audit-row.type';
import { AuditService } from './audit.service';
import { AuditErrors } from './audit-errors.constant';

// Admin-only audit trail viewer (Day 13). Read-only by design — see
// AuditRepository (no update/delete method exists) and the
// immutability guard below for what happens if someone tries anyway.
@ApiBearerAuth()
@RequirePermission(Permission.AUDIT_READ)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async list(@Query() query: AuditQueryDto): Promise<AuditRow[]> {
    return this.auditService.list(
      {
        entity: query.entity,
        performedBy: query.performedBy,
        from: query.from,
        to: query.to,
      },
      query.page,
      query.limit,
    );
  }

  // Evidence you can edit isn't evidence — these routes exist only to
  // turn "someone tried to modify an audit row" into a clear, typed
  // failure instead of a generic 404. AuditRepository never gains an
  // update()/delete() method; this is the second layer of the same
  // guarantee, at the API surface.
  @Patch(':id')
  update(@Param('id') _id: string): never {
    throw AuditErrors.immutable();
  }

  @Delete(':id')
  remove(@Param('id') _id: string): never {
    throw AuditErrors.immutable();
  }
}
