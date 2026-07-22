import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamRepository } from './team.repository';
import { TeamService } from './team.service';

// The module declares what this feature is made of.
// Follows the _template/todo layout: controller -> service -> repository.
@Module({
  controllers: [TeamController],
  providers: [TeamService, TeamRepository],
})
export class TeamModule {}
