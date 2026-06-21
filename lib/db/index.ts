/**
 * Drizzle client for CLI tools only (`npm run db:push`, `db:studio`).
 * Runtime data access uses the Supabase client (lib/data/*) so the app
 * does not require a direct Postgres password at runtime.
 */
import { drizzle } from "drizzle-orm/postgres-js";

import { createPostgresClient } from "@/lib/db/config";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    _db = drizzle(createPostgresClient(), { schema });
  }
  return _db;
}
