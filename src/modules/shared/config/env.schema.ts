import { z } from 'zod';

// Zod's ONE home in this codebase: the environment. Runtime validation
// here because process.env is untyped and unchecked at runtime — a
// TypeScript `interface` alone cannot guarantee these keys exist.
// If a required variable is missing, parsing throws and the app must
// not start (see main.ts / ConfigModule wiring).
const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  SWAGGER_USER: z.string().min(1, 'SWAGGER_USER is required'),
  SWAGGER_PASSWORD: z.string().min(1, 'SWAGGER_PASSWORD is required'),
  FEATURE_X_ENABLED: z.coerce.boolean().default(false),
  FEATURE_X_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  AI_PROVIDER: z.enum(['mock', 'gemini']).default('mock'),
  GEMINI_API_KEY: z.string().optional(),
});

export const envSchema = baseEnvSchema.superRefine((data, ctx) => {
  if (data.FEATURE_X_ENABLED && !data.FEATURE_X_API_KEY) {
    ctx.addIssue({
      code: 'custom',
      path: ['FEATURE_X_API_KEY'],
      message: 'FEATURE_X_API_KEY is required when FEATURE_X_ENABLED is true',
    });
  }
  if (data.AI_PROVIDER === 'gemini' && !data.GEMINI_API_KEY) {
    ctx.addIssue({
      code: 'custom',
      path: ['GEMINI_API_KEY'],
      message: 'GEMINI_API_KEY is required when AI_PROVIDER is "gemini"',
    });
  }
});

// One schema, types for free — no separate `interface Env` to keep in sync.
export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }
  return result.data;
}
