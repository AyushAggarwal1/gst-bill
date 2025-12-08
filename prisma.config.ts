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
    // Optional shadow database URL (used by Migrate); safe to omit if not set
    shadowDatabaseUrl: process.env.DIRECT_URL,
  },
});
