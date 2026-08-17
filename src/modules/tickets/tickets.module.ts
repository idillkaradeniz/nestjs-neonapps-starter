import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { TicketCommentRepository } from './ticket-comment.repository';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Env } from '../shared/config/env.schema';
import { TicketsGateway } from './tickets.gateway';
import { AiModule } from '../shared/ai/ai.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
      }),
    }),
    AiModule,
  ],
  controllers: [TicketController],
  providers: [
    TicketService,
    TicketRepository,
    TicketCommentRepository,
    TicketsGateway,
  ],
})
export class TicketsModule {}
