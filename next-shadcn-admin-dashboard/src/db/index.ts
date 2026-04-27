// ============================================================================
// DB Connection — Neon Postgres via Drizzle ORM
// ============================================================================

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return url;
};

// Lazy init — only connects when DATABASE_URL is available
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Please configure Neon Postgres in Vercel dashboard."
    );
  }
  if (!_db) {
    const sql = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export { schema };
