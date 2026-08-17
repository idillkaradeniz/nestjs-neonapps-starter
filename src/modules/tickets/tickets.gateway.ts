import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ namespace: 'tickets' })
export class TicketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TicketsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const authToken = client.handshake.auth?.token as string | undefined;
    const headerAuth = client.handshake.headers.authorization;
    const headerToken = headerAuth?.startsWith('Bearer ')
      ? headerAuth.slice(7)
      : undefined;
    const token = authToken ?? headerToken;

    if (!token) {
      this.logger.warn(`Connection rejected (no token): ${client.id}`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      client.data.user = { id: payload.sub, email: payload.email, role: payload.role };
      this.logger.log(`Client connected: ${client.id} (user ${payload.sub})`);
    } catch {
      this.logger.warn(`Connection rejected (invalid token): ${client.id}`);
      client.disconnect();
    }
  }

  @SubscribeMessage('join-ticket')
  handleJoinTicket(
    @MessageBody() data: { ticketId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `ticket:${data.ticketId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined ${room}`);
    return { event: 'joined', room };
  }

  broadcastNewComment(ticketId: string, payload: unknown) {
    const room = `ticket:${ticketId}`;
    this.server.to(room).emit('new-comment', payload);
    this.logger.log(`Broadcast new-comment to ${room}`);
  }

  broadcastStatusChanged(ticketId: string, payload: unknown) {
    const room = `ticket:${ticketId}`;
    this.server.to(room).emit('status-changed', payload);
    this.logger.log(`Broadcast status-changed to ${room}`);
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user as { id: string } | undefined;
    this.logger.log(
      `Client disconnected: ${client.id}${user ? ` (user ${user.id})` : ''}`,
    );
  }
}
