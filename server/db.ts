import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Add SSL for external connections (like Vercel)
export const pool = new Pool({ 
  connectionString,
  ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') 
    ? false 
    : { rejectUnauthorized: false },
  max: 1, // Minimize connections in serverless environment
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
export const db = drizzle(pool, { schema });
