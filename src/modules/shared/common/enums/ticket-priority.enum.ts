export const TicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TicketPriority =
  (typeof TicketPriority)[keyof typeof TicketPriority];
