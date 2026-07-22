// Domain type for this module. Mirrors the Colleague/Team types modeled
// on Day 0. In-memory mock data today; a real lookup once persistence
// lands (see _template/todo for the pattern this module follows).
export const TEAMS = [
  'backend',
  'frontend',
  'mobile',
  'design',
  'product',
  'qa',
  'staff',
  'bizDev',
] as const;

export type Team = (typeof TEAMS)[number];

export interface Colleague {
  name: string;
  role: string;
  team: Team;
}
