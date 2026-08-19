import { DomainException } from '../shared/common/errors/domain.exception';
import { ErrorCodeDefinition } from '../shared/common/errors/error-code-definition.interface';
import { TicketErrorCode } from '../shared/common/enums';

export const TICKET_ERRORS: Record<TicketErrorCode, ErrorCodeDefinition> = {
  [TicketErrorCode.NOT_FOUND]: {
    code: TicketErrorCode.NOT_FOUND,
    status: 404,
    message: 'Ticket {id} not found',
  },
  [TicketErrorCode.ALREADY_CLOSED]: {
    code: TicketErrorCode.ALREADY_CLOSED,
    status: 400,
    message: 'Ticket {id} is already closed and cannot be modified',
  },
  [TicketErrorCode.OPEN_LIMIT_EXCEEDED]: {
    code: TicketErrorCode.OPEN_LIMIT_EXCEEDED,
    status: 400,
    message:
      'You already have {limit} open tickets; close one before creating a new ticket',
  },
  [TicketErrorCode.NOT_ASSIGNED_TO_YOU]: {
    code: TicketErrorCode.NOT_ASSIGNED_TO_YOU,
    status: 403,
    message: 'Only the assigned agent can perform this action on ticket {id}',
  },
};

export const TicketErrors = {
  notFound: (params: { id: string }) =>
    new DomainException(TICKET_ERRORS[TicketErrorCode.NOT_FOUND], params),
  alreadyClosed: (params: { id: string }) =>
    new DomainException(TICKET_ERRORS[TicketErrorCode.ALREADY_CLOSED], params),
  openLimitExceeded: (params: { limit: number }) =>
    new DomainException(
      TICKET_ERRORS[TicketErrorCode.OPEN_LIMIT_EXCEEDED],
      params,
    ),
  notAssignedToYou: (params: { id: string }) =>
    new DomainException(
      TICKET_ERRORS[TicketErrorCode.NOT_ASSIGNED_TO_YOU],
      params,
    ),
};
