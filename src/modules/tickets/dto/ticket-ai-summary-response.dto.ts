import { ApiProperty } from '@nestjs/swagger';

export class TicketAiSummaryResponseDto {
  @ApiProperty()
  summary: string;

  @ApiProperty({ type: [String] })
  tags: string[];
}
