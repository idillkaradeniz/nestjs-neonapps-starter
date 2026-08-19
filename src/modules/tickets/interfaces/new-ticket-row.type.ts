import { TicketPriority } from '../../shared/common/enums';

export type NewTicketRow = {
  title: string;
  description: string;
  priority: TicketPriority;
  createdBy: string;
};
