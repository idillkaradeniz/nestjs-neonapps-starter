import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

// Mirrors ResponseTransformInterceptor: wraps whatever DTO the endpoint
// actually returns in { success: true, data: T }, so Swagger shows the
// real response shape instead of just the bare DTO.
export function ApiSuccessResponse<TModel extends Type<unknown>>(
  model: TModel,
  options?: { status?: number; isArray?: boolean },
) {
  const status = options?.status ?? 200;
  const dataSchema = options?.isArray
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: dataSchema,
        },
      },
    }),
  );
}
