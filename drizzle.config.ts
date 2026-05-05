import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './lib/db/schema/*.ts',
  out: './lib/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'mysql://user:password@host:3306/database'
  },
} satisfies Config;