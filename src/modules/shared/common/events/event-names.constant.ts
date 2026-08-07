// Central registry of every domain event name. `as const` keeps each
// value a literal string type (not just `string`), so emit()/OnEvent()
// calls get autocomplete and a typo becomes a compile error instead of
// a silently-never-fired event.
export const EventNames = {
  USER_CREATED: 'user.created',
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];
