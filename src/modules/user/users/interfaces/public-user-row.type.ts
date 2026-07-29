import { UserRow } from './user-row.type';

// The shape of a User that's safe to send over HTTP — everything from
// UserRow EXCEPT passwordHash. Written as an explicit field list
// (below, in to-public-user.ts) rather than `Omit<UserRow, 'passwordHash'>`
// alone, so adding a new sensitive column to the table later doesn't
// silently start leaking it — someone has to consciously add it here.
export type PublicUserRow = Omit<UserRow, 'passwordHash'>;
