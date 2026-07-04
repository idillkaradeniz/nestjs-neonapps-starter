// Entry point: creates the Nest application and starts the HTTP server.
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// void-ok — bootstrap runs for its side effect (starting the server).
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global validation: every incoming body is checked against its DTO.
  // - whitelist: silently strips properties not declared on the DTO
  // - forbidNonWhitelisted: rejects the request (400) if extras are sent
  // - transform: turns the plain JSON body into a real DTO class instance
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // PORT comes from .env (loaded by ConfigModule); 3000 is the fallback.
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

void bootstrap();
