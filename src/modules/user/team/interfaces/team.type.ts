import { TEAMS } from './teams.constant';

// Derived from TEAMS — one team name, not the array itself.
export type Team = (typeof TEAMS)[number];
