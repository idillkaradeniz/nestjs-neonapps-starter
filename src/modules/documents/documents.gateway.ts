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

@WebSocketGateway({ namespace: 'documents' })
export class DocumentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DocumentsGateway.name);

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

  @SubscribeMessage('join-document')
  handleJoinDocument(
    @MessageBody() data: { documentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `doc:${data.documentId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined ${room}`);
    return { event: 'joined', room };
  }

  broadcastUpdate(documentId: string, payload: unknown) {
    const room = `doc:${documentId}`;
    this.server.to(room).emit('document-updated', payload);
    this.logger.log(`Broadcast to ${room}`);
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user as { id: string } | undefined;
    this.logger.log(
      `Client disconnected: ${client.id}${user ? ` (user ${user.id})` : ''}`,
    );
  }
}
