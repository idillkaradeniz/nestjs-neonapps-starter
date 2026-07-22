import { Controller, Get } from '@nestjs/common';
import { Colleague } from './interfaces/colleague.interface';
import { TeamService } from './team.service';

// Controller = HTTP shape ONLY: route and response type.
// No logic here — it translates HTTP into a service call
// (see _template/todo for the pattern this module follows).
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // GET /team
  @Get()
  list(): Colleague[] {
    return this.teamService.list();
  }
}
