import pg from "pg";
const { Pool } = pg;  // Use 'pg' instead of Neon
import { drizzle } from 'drizzle-orm/node-postgres';// Import drizzle from 'drizzle-orm' instead of neon-serverless
import * as schema from '@shared/schema'; // Import your schema
import dotenv from 'dotenv';

dotenv.config();

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

// Set up PostgreSQL connection pool with the connection string from the environment variable
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Set up Drizzle ORM with the PostgreSQL client and your schema
export const db = drizzle(pool, { schema });
