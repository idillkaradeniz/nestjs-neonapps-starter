// Day 11 bonus infra: writes the exact OpenAPI JSON Swagger UI serves to
// a stable path on disk (docs/api/openapi.json), without starting an
// HTTP listener. This is the file Day 20's frontend team runs
// openapi-typescript against — it must be regenerated whenever a route
// or DTO changes (see the "gen:api" README note).
import 'reflect-metadata';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

const OUTPUT_PATH = 'docs/api/openapi.json';

// void-ok — script runs for its side effect (writing a file), then exits.
async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });

  // Mirrors main.ts exactly — the generated spec must match what a
  // running server actually serves at /api/docs-json.
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ironclad Initiative API')
    .setDescription('API documentation for the Ironclad Initiative backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(document, null, 2) + '\n');
  console.log(`OpenAPI spec written to ${OUTPUT_PATH}`);

  await app.close();
}

generate().catch((err: unknown) => {
  console.error('Failed to generate OpenAPI spec:', err);
  process.exit(1);
});
