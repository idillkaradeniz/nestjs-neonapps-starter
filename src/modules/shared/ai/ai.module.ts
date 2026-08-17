import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../config/env.schema';
import { AI_PROVIDER } from './ai-provider.token';
import { MockAiAdapter } from './mock-ai.adapter';
import { GeminiAdapter } from './gemini-ai.adapter';

@Module({
  providers: [
    MockAiAdapter,
    GeminiAdapter,
    {
      provide: AI_PROVIDER,
      inject: [ConfigService, MockAiAdapter, GeminiAdapter],
      useFactory: (
        configService: ConfigService<Env, true>,
        mock: MockAiAdapter,
        gemini: GeminiAdapter,
      ) => {
        const provider = configService.get('AI_PROVIDER', { infer: true });
        return provider === 'gemini' ? gemini : mock;
      },
    },
  ],
  exports: [AI_PROVIDER],
})
export class AiModule {}
