// The contract between UserService (emitter) and any listener. Neither
// side imports the other directly — both only depend on this shared
// shape and the event name in EventNames.
export interface UserCreatedEvent {
  userId: string;
  email: string;
  name: string;
}
