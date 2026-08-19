import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { AiAdapter } from './ai-adapter.interface';
import { Env } from '../config/env.schema';

@Injectable()
export class GeminiAdapter implements AiAdapter {
  private readonly logger = new Logger(GeminiAdapter.name);
  private readonly model;

  constructor(configService: ConfigService<Env, true>) {
    const google = createGoogleGenerativeAI({
      apiKey: configService.get('GEMINI_API_KEY', { infer: true }),
    });
    this.model = google('gemini-3.5-flash');
  }

  async summarize(text: string): Promise<string> {
    this.logger.log('Requesting summary from Gemini');
    const { object } = await generateObject({
      model: this.model,
      schema: z.object({ summary: z.string() }),
      prompt: `Summarize the following support ticket thread in 2-3 concise sentences:\n\n${text}`,
    });
    return object.summary;
  }

  async generateTags(text: string): Promise<string[]> {
    this.logger.log('Requesting tags from Gemini');
    const { object } = await generateObject({
      model: this.model,
      schema: z.object({ tags: z.array(z.string()).max(5) }),
      prompt: `Generate up to 5 short category tags for the following support ticket thread:\n\n${text}`,
    });
    return object.tags;
  }
}
