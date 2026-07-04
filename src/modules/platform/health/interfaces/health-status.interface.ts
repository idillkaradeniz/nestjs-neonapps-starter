// Exported types live in interfaces/, one export per file (see CLAUDE.md-style
// conventions: types that leave their file get their own *.interface.ts).
export interface HealthStatus {
  status: 'ok';
  uptime: number;
}
