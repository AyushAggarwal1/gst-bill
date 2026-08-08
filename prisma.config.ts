import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Use the classic Prisma ORM engine so we don't need adapters/Accelerate
  engine: 'classic',
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Primary database connection URL (read from .env / environment)
    url: env('DATABASE_URL'),
    // Optional shadow database URL (used by `migrate dev`). Must be a SEPARATE
    // empty database — never the main DB (DIRECT_URL points at the main DB, so
    // it must not be used here). Omit unless SHADOW_DATABASE_URL is configured.
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
});
