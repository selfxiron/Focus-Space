/**
 * Applies supabase/migrations/0000_initial.sql using DATABASE_* from .env.local
 * Usage: npm run db:setup
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    console.warn("No .env.local found — using existing environment variables.");
  }
}

async function main() {
  loadEnvLocal();

  const host = process.env.DATABASE_HOST?.trim();
  const user = process.env.DATABASE_USER?.trim();
  const password = process.env.DATABASE_PASSWORD;

  if (!host || !user || !password) {
    console.error(
      "Missing DATABASE_HOST, DATABASE_USER, or DATABASE_PASSWORD in .env.local"
    );
    process.exit(1);
  }

  const migrationPath = resolve(
    process.cwd(),
    "supabase/migrations/0000_initial.sql"
  );
  const migration = readFileSync(migrationPath, "utf8");

  const sql = postgres({
    host,
    port: Number(process.env.DATABASE_PORT ?? 6543),
    username: user,
    password,
    database: process.env.DATABASE_NAME?.trim() ?? "postgres",
    ssl: "require",
    max: 1,
  });

  console.log("Applying migration to", host, "...");

  try {
    await sql.unsafe(migration);
    console.log("Done. Tables and RLS policies are ready.");
    console.log("Restart npm run dev and reload the app.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
