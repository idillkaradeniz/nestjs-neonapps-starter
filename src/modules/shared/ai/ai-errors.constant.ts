import { DomainException } from '../common/errors/domain.exception';
import { ErrorCodeDefinition } from '../common/errors/error-code-definition.interface';
import { AiErrorCode } from '../common/enums';

export const AI_ERRORS: Record<AiErrorCode, ErrorCodeDefinition> = {
  [AiErrorCode.PROVIDER_UNAVAILABLE]: {
    code: AiErrorCode.PROVIDER_UNAVAILABLE,
    status: 503,
    message: 'AI provider is currently unavailable, please try again later',
  },
};

export const AiErrors = {
  providerUnavailable: () =>
    new DomainException(AI_ERRORS[AiErrorCode.PROVIDER_UNAVAILABLE]),
};
