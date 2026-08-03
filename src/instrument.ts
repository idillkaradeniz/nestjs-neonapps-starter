import 'dotenv/config';
import * as Sentry from '@sentry/nestjs';

// Must run before any other module loads — see main.ts, this file is
// imported as the very first line, before even NestFactory. Feature-
// flagged the same way as Day 3's FEATURE_X pattern: if SENTRY_DSN is
// unset, Sentry.init() gets `dsn: undefined` and the whole SDK becomes
// a no-op — every Sentry.* call anywhere in the app silently does
// nothing, no network calls, nothing breaks.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  debug: true,
});
