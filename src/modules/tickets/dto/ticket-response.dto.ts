import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '../../shared/common/enums';

export class TicketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty({ enum: TicketPriority })
  priority: TicketPriority;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ nullable: true })
  assignedTo: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  closedAt: Date | null;
}
