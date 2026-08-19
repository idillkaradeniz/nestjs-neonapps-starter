import { Injectable } from '@nestjs/common';
import { AiAdapter } from './ai-adapter.interface';

@Injectable()
export class MockAiAdapter implements AiAdapter {
  async summarize(text: string): Promise<string> {
    const trimmed = text.trim();
    const preview =
      trimmed.length > 120 ? `${trimmed.slice(0, 120)}...` : trimmed;
    return `[MOCK SUMMARY] ${preview}`;
  }

  async generateTags(text: string): Promise<string[]> {
    const words = text
      .toLowerCase()
      .replace(/[^a-zçğıöşü0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);

    const unique = Array.from(new Set(words));
    return unique.slice(0, 3);
  }
}
