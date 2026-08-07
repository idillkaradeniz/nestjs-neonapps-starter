import { AuditInterceptor } from './modules/platform/audit/audit.interceptor';
import { AuditService } from './modules/platform/audit/audit.service';
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
import { CacheInterceptor } from './modules/shared/common/cache/cache.interceptor';
import { RedisService } from './modules/shared/redis/redis.service';
import { ResponseTransformInterceptor } from './modules/shared/common/interceptors/response-transform.interceptor';
import { ERROR_REGISTRY } from './modules/shared/common/errors/error-registry';
import { Logger } from 'nestjs-pino';
import { validationExceptionFactory } from './modules/shared/common/utils/validation-exception-factory';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

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

  // URI versioning: every route lives under /api/v1/... by default.
  // /health opts out (VERSION_NEUTRAL) — infra/load-balancer health
  // checks shouldn't need to know or care about API versions.
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
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

  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(app.get(Reflector)),
    new CacheInterceptor(app.get(RedisService), app.get(Reflector)),
    new AuditInterceptor(app.get(AuditService), app.get(Reflector)),
  );

  // PORT comes from .env, already validated by Zod at startup — never
  // read process.env directly, always go through ConfigService.
  const configService = app.get(ConfigService<Env, true>);
  const port = configService.get('PORT', { infer: true });

  // Day 11: OpenAPI/Swagger docs. addBearerAuth() registers a "bearer"
  // security scheme — this is what puts the "Authorize" button in
  // Swagger UI, letting a token be pasted once and reused across every
  // "Try it out" call instead of setting the header by hand each time.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ironclad Initiative API')
    .setDescription('API documentation for the Ironclad Initiative backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  // Swagger exposes the entire API surface (every route, every DTO
  // shape) — fine in dev, a gift to an attacker in prod. Outside
  // development, gate both the UI and the raw JSON behind HTTP Basic
  // Auth using Day 3's SWAGGER_USER/SWAGGER_PASSWORD env vars. No new
  // dependency: Basic Auth is just one header, easy to check by hand.
  const isDev =
    configService.get('NODE_ENV', { infer: true }) === 'development';
  const docsPaths = ['/api/docs', '/api/docs-json'];
  if (!isDev) {
    const swaggerUser = configService.get('SWAGGER_USER', { infer: true });
    const swaggerPassword = configService.get('SWAGGER_PASSWORD', {
      infer: true,
    });
    app.use(
      docsPaths,
      (req: Request, res: Response, next: NextFunction): void => {
        const header = req.headers.authorization;
        if (header?.startsWith('Basic ')) {
          const [user, password] = Buffer.from(header.slice(6), 'base64')
            .toString('utf8')
            .split(':');
          if (user === swaggerUser && password === swaggerPassword) {
            next();
            return;
          }
        }
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
        res.status(401).send('Authentication required');
      },
    );
  }

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}
void bootstrap();
