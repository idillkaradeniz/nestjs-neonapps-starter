import { Injectable } from '@nestjs/common';
import { Colleague } from './interfaces/colleague.interface';
import { TeamRepository } from './team.repository';

// Service = business logic and orchestration. It never touches storage
// directly — it asks the repository. No business rules needed yet for
// a simple read-only list, but the layer stays in place for consistency
// (see _template/todo for the pattern this module follows).
@Injectable()
export class TeamService {
  constructor(private readonly teamRepository: TeamRepository) {}

  list(): Colleague[] {
    return this.teamRepository.findAll();
  }
}
