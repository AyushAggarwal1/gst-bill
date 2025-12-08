import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    // Primary database connection URL (read from .env / environment)
    url: process.env.DATABASE_URL ?? '',
    // Optional shadow database URL (used by Migrate); safe to omit if not set
    shadowDatabaseUrl: process.env.DIRECT_URL,
  },
});
