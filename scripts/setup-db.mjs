/**
 * Applies supabase/migrations/*.sql using DATABASE_* from .env.local
 * Usage: npm run db:setup
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
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
      // Always prefer .env.local for database vars (shell env can leak wrong values)
      if (key.startsWith("DATABASE_")) {
        process.env[key] = value;
      } else if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    console.warn("No .env.local found — using existing environment variables.");
  }
}

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, "") || "postgres",
  };
}

async function main() {
  loadEnvLocal();

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const fromUrl = databaseUrl ? parseDatabaseUrl(databaseUrl) : null;

  const host = fromUrl?.host ?? process.env.DATABASE_HOST?.trim();
  const user = fromUrl?.user ?? process.env.DATABASE_USER?.trim();
  const password = fromUrl?.password ?? process.env.DATABASE_PASSWORD;
  const port = fromUrl?.port ?? Number(process.env.DATABASE_PORT ?? 6543);
  const database =
    fromUrl?.database ?? process.env.DATABASE_NAME?.trim() ?? "postgres";

  if (!host || !user || !password) {
    console.error(
      "Missing database credentials. Set DATABASE_HOST, DATABASE_USER, and DATABASE_PASSWORD in .env.local, or DATABASE_URL."
    );
    process.exit(1);
  }

  const migrationDir = resolve(process.cwd(), "supabase/migrations");
  const migrationFiles = readdirSync(migrationDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const sql = postgres({
    host,
    port,
    user,
    password,
    database,
    ssl: "require",
    max: 1,
    connect_timeout: 15,
  });

  console.log(`Connecting as ${user}@${host}:${port}/${database} ...`);

  try {
    for (const file of migrationFiles) {
      const migration = readFileSync(join(migrationDir, file), "utf8");
      console.log(`  → ${file}`);
      await sql.unsafe(migration);
    }
    console.log("Done. Tables and RLS policies are ready.");
    console.log("Restart npm run dev and reload the app.");
  } catch (error) {
    console.error("Migration failed:", error);
    if (error?.code === "28P01") {
      console.error(
        "\nPassword authentication failed. This is your Supabase *database* password (not the anon key).\n" +
          "Fix: Supabase Dashboard → Project Settings → Database → Reset database password,\n" +
          "then update DATABASE_PASSWORD in .env.local (use quotes if it has special characters).\n" +
          "Or paste supabase/migrations/0001_user_settings.sql into the SQL Editor instead."
      );
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
