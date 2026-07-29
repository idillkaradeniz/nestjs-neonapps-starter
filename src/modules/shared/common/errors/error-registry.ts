import { ErrorCodeDefinition } from './error-code-definition.interface';
import { USER_ERRORS } from '../../../user/users/user-errors.constant';
// Every domain's error map gets merged here at import time. If two
// domains ever pick the same `code` string, this throws immediately —
// a collision is a build problem, not something that should surface
// as a runtime surprise the first time that error path fires.
const DOMAIN_MAPS: Record<string, ErrorCodeDefinition>[] = [USER_ERRORS];

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
