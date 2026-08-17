export interface AiAdapter {
  summarize(text: string): Promise<string>;
  generateTags(text: string): Promise<string[]>;
}
