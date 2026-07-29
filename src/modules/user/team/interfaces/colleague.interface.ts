import { Team } from './team.type';

// Domain type for this module. Mirrors the Colleague/Team types modeled
// on Day 0. In-memory mock data today; a real lookup once persistence
// lands (see _template/todo for the pattern this module follows).
export interface Colleague {
  name: string;
  role: string;
  team: Team;
}
