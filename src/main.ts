// Must be the first import — Sentry needs to instrument things (http,
// etc.) before any other module loads. See instrument.ts.
import './instrument';
// Entry point: creates the Nest application and starts the HTTP server.
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Env } from './modules/shared/config/env.schema';
import { HttpExceptionFilter } from './modules/shared/common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './modules/shared/common/interceptors/response-transform.interceptor';
import { ERROR_REGISTRY } from './modules/shared/common/errors/error-registry';
import { Logger } from 'nestjs-pino';
import { validationExceptionFactory } from './modules/shared/common/utils/validation-exception-factory';

// void-ok — bootstrap runs for its side effect (starting the server).
async function bootstrap(): Promise<void> {
  // Importing error-registry runs its merge-and-crash-on-duplicate check
  // at module load time — before the app even starts listening. A
  // colliding error code is a build problem, so we want to know about it
  // here, not the first time some rare error path fires in production.
  console.log(
    `Error registry loaded with ${Object.keys(ERROR_REGISTRY).length} codes.`,
  );

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Global validation: every incoming body is checked against its DTO.
  // - whitelist: silently strips properties not declared on the DTO
  // - forbidNonWhitelisted: rejects the request (400) if extras are sent
  // - transform: turns the plain JSON body into a real DTO class instance
  // - exceptionFactory: converts validation failures into our Day 5
  //   envelope shape instead of Nest's default { statusCode, message,
  //   error } — see validation-exception-factory.ts.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  // Every thrown exception — DomainException, Nest's own HttpException,
  // or a genuinely unexpected bug — gets normalized into one response
  // shape by this filter (see http-exception.filter.ts).
  app.useGlobalFilters(new HttpExceptionFilter());

  // Every successful response gets wrapped in { success: true, data },
  // mirroring the filter above (see response-transform.interceptor.ts).
  // app.get(Reflector) reuses Nest's own Reflector instance instead of
  // constructing a new one by hand.
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(app.get(Reflector)),
  );

  // PORT comes from .env, already validated by Zod at startup — never
  // read process.env directly, always go through ConfigService.
  const configService = app.get(ConfigService<Env, true>);
  const port = configService.get('PORT', { infer: true });

  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}
void bootstrap();
