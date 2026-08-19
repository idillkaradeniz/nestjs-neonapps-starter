import { TicketPriority } from '../../shared/common/enums';

export type TicketRow = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: TicketPriority;
  createdBy: string;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
};
