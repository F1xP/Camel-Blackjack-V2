import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/drizzle/schema';

import dotenv from 'dotenv';
dotenv.config();

import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Fix for "sorry, too many clients already"
declare global {
  // eslint-disable-next-line no-var -- only var works here
  var db: PostgresJsDatabase<typeof schema> | undefined;
}

let db: PostgresJsDatabase<typeof schema>;

if (process.env.NODE_ENV === 'production') {
  db = drizzle(postgres(process.env.POSTGRES_URL!), { schema });
} else {
  if (!global.db) global.db = drizzle(postgres(process.env.POSTGRES_URL!), { schema });

  db = global.db;
}

export { db };

export type DBTransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];
