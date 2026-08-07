import { auditLogs } from '../../../shared/database/schema/audit-log.schema';

export type AuditRow = typeof auditLogs.$inferSelect;
export type NewAuditRow = typeof auditLogs.$inferInsert;
