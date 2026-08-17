import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../shared/common/decorators/api-success-response.decorator';
import { ApiErrorCodes } from '../../shared/common/decorators/api-error-codes.decorator';
import { AuthErrorCode } from '../../shared/common/enums';
import { ColleagueResponseDto } from './dto/colleague-response.dto';
import { Colleague } from './interfaces/colleague.interface';
import { TeamService } from './team.service';

// Not @Public() — sits behind the global JwtAuthGuard.
@ApiBearerAuth()
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @ApiSuccessResponse(ColleagueResponseDto, { isArray: true })
  @ApiErrorCodes(
    AuthErrorCode.TOKEN_MISSING,
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
  )
  list(): Colleague[] {
    return this.teamService.list();
  }
}
