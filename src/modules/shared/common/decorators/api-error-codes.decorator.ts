import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ERROR_REGISTRY } from '../errors/error-registry';
import { ErrorResponseDto } from '../dto/error-response.dto';

// Renders a route's possible domain error codes into Swagger, grouped by
// HTTP status — pulled straight from the Day 5 ERROR_REGISTRY, so the
// docs can't drift from what a route actually throws: this IS the
// single source of truth, not a hand-maintained parallel list.
export function ApiErrorCodes(...codes: string[]): MethodDecorator {
  const byStatus = new Map<number, string[]>();

  for (const code of codes) {
    const definition = ERROR_REGISTRY[code];
    if (!definition) {
      throw new Error(
        `ApiErrorCodes: unknown error code "${code}" — check ERROR_REGISTRY.`,
      );
    }
    const lines = byStatus.get(definition.status) ?? [];
    lines.push(`**${code}** — ${definition.message}`);
    byStatus.set(definition.status, lines);
  }

  const responseDecorators = Array.from(byStatus.entries()).map(
    ([status, lines]) =>
      ApiResponse({
        status,
        description: lines.join('<br/>'),
        schema: { $ref: getSchemaPath(ErrorResponseDto) },
      }),
  );

  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ...responseDecorators,
  );
}
