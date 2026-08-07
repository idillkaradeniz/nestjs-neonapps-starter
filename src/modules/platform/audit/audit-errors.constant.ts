import { DomainException } from '../../shared/common/errors/domain.exception';
import { ErrorCodeDefinition } from '../../shared/common/errors/error-code-definition.interface';
import { AuditErrorCode } from './audit-error-code.enum';

export const AUDIT_ERRORS: Record<AuditErrorCode, ErrorCodeDefinition> = {
  [AuditErrorCode.IMMUTABLE]: {
    code: AuditErrorCode.IMMUTABLE,
    status: 403,
    message: 'Audit records are append-only and cannot be modified or deleted',
  },
};

export const AuditErrors = {
  immutable: () => new DomainException(AUDIT_ERRORS[AuditErrorCode.IMMUTABLE]),
};
