/**
 * Static checks: migration tables vs Drizzle schema names.
 * Run: node scripts/validate-schema.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const migrationDir = join(root, "supabase/migrations");
const migration = readdirSync(migrationDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(join(migrationDir, file), "utf8"))
  .join("\n");

const expectedTables = [
  "subjects",
  "time_entries",
  "todos",
  "goals",
  "notes",
  "pomodoro_sessions",
  "user_settings",
];

const missing = expectedTables.filter(
  (table) => !migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`)
);

if (missing.length) {
  console.error("Migration missing tables:", missing.join(", "));
  process.exit(1);
}

const rlsTables = expectedTables.filter(
  (table) => !migration.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
);

if (rlsTables.length) {
  console.error("Migration missing RLS on:", rlsTables.join(", "));
  process.exit(1);
}

console.log("Schema validation OK:");
console.log(`  Tables: ${expectedTables.length}`);
console.log(`  RLS enabled on all tables`);
