import { Injectable } from '@nestjs/common';
import { Colleague } from './interfaces/colleague.interface';

// Repository = the ONLY layer that touches storage.
// Today "storage" is a hardcoded in-memory array (mock data from Day 0's
// colleague rounds). No database yet — that lands on Day 3.
@Injectable()
export class TeamRepository {
  private readonly colleagues: Colleague[] = [
    { name: 'İrem', role: 'Flutter Developer', team: 'mobile' },
    { name: 'Yuşa', role: 'Flutter Developer', team: 'mobile' },
    { name: 'Eren', role: 'Fullstack Developer', team: 'backend' },
    { name: 'Can', role: 'Fullstack Developer', team: 'backend' },
    { name: 'İlknur', role: 'Flutter Developer', team: 'mobile' },
    { name: 'Samet', role: 'Fullstack Developer', team: 'backend' },
    { name: 'Arda', role: 'Fullstack Developer', team: 'backend' },
    { name: 'Remzi', role: 'Flutter Developer', team: 'mobile' },
    { name: 'Sarp', role: 'Designer', team: 'design' },
    { name: 'Anıl', role: 'Designer', team: 'design' },
    { name: 'Alihan', role: 'Designer', team: 'design' },
    { name: 'Esra', role: 'Flutter Developer', team: 'mobile' },
    { name: 'Barış', role: 'Fullstack Developer', team: 'backend' },
    { name: 'Ayşe', role: 'Designer', team: 'design' },
    { name: 'Dilan', role: 'Designer', team: 'design' },
    { name: 'Melisa', role: 'Designer', team: 'design' },
    { name: 'Faruk', role: 'Flutter Developer', team: 'mobile' },
    { name: 'Sema', role: 'Staff', team: 'staff' },
    { name: 'Doğukan', role: 'Flutter Developer', team: 'mobile' },
    { name: 'Hasan', role: 'Flutter Developer', team: 'mobile' },
    { name: 'Gökhay', role: 'Business Development', team: 'bizDev' },
    { name: 'Serhat', role: 'iOS Developer', team: 'mobile' },
  ];

  findAll(): Colleague[] {
    return this.colleagues;
  }
}
