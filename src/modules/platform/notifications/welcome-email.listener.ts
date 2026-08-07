import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventNames } from '../../shared/common/events/event-names.constant';
import { UserCreatedEvent } from '../../user/users/events/user-created.event';

// Listener side of the user.created event. Deliberately has ZERO
// knowledge of UserService — it only imports the shared contract
// (EventNames + UserCreatedEvent), never UserService itself. This is
// the "emitter and listener never import each other" rule from the
// brief, made concrete.
@Injectable()
export class WelcomeEmailListener {
  private readonly logger = new Logger(WelcomeEmailListener.name);

  @OnEvent(EventNames.USER_CREATED)
  handleUserCreated(payload: UserCreatedEvent): void {
    this.logger.log(`Welcome mail sent to ${payload.email}`);
  }
}
