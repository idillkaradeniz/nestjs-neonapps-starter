import { ErrorCodeDefinition } from './error-code-definition.interface';
import { USER_ERRORS } from '../../../user/users/user-errors.constant';
import { AUTH_ERRORS } from '../../../auth/auth-errors.constant';
import { AUDIT_ERRORS } from '../../../platform/audit/audit-errors.constant';
import { UPLOAD_ERRORS } from '../../../uploads/upload-errors.constant';
import { TICKET_ERRORS } from '../../../tickets/ticket-errors.constant';
import { AI_ERRORS } from '../../ai/ai-errors.constant';
const DOMAIN_MAPS: Record<string, ErrorCodeDefinition>[] = [
  USER_ERRORS,
  AUTH_ERRORS,
  AUDIT_ERRORS,
  UPLOAD_ERRORS,
  TICKET_ERRORS,
  AI_ERRORS,
];

export const ERROR_REGISTRY: Record<string, ErrorCodeDefinition> = {};

for (const map of DOMAIN_MAPS) {
  for (const definition of Object.values(map)) {
    if (ERROR_REGISTRY[definition.code]) {
      throw new Error(
        `Duplicate error code detected: "${definition.code}" is defined in more than one domain.`,
      );
    }
    ERROR_REGISTRY[definition.code] = definition;
  }
}
