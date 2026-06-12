import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import ws from 'ws';

// Polyfill WebSocket for local Node.js environments
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required. Ensure you use the pooled connection string.");
}

const pool = new Pool({ 
  connectionString, 
  connectionTimeoutMillis: 5000 
});
export const db = drizzle(pool, { schema });
export type Db = typeof db;
