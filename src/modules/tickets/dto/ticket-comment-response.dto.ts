import { ApiProperty } from '@nestjs/swagger';

export class TicketCommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ticketId: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  createdAt: Date;
}
