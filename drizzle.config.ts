import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

// Tells drizzle-kit where the schema lives and how to reach the DB
// when generating/running migrations. Not used by the running app —
// the app talks to the DB through DatabaseModule (see src/modules/shared/database).
export default defineConfig({
  schema: './src/modules/shared/database/schema/index.ts',
  out: './src/modules/shared/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
