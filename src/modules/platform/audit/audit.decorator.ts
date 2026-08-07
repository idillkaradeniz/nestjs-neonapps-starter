import { SetMetadata } from '@nestjs/common';
import { AuditAction } from './audit-action.enum';
import { AUDIT_METADATA_KEY } from './audit.constants';

export interface AuditOptions {
  entity: string;
  action: AuditAction;
}

// Metadata-only, same split as @Cacheable/@CacheEvict — AuditInterceptor
// does the real work, this decorator just tags which routes to audit
// and with what entity/action label.
export const Audit = (options: AuditOptions): MethodDecorator =>
  SetMetadata(AUDIT_METADATA_KEY, options);
