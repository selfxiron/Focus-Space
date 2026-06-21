import postgres from "postgres";

const baseOptions = {
  ssl: "require" as const,
  prepare: false,
};

/**
 * Prefer discrete DATABASE_* vars so passwords with special characters
 * do not need URL encoding. Fall back to DATABASE_URL if set.
 */
export function createPostgresClient() {
  const host = process.env.DATABASE_HOST?.trim();
  const user = process.env.DATABASE_USER?.trim();
  const password = process.env.DATABASE_PASSWORD;

  if (host && user && password) {
    return postgres({
      ...baseOptions,
      host,
      port: Number(process.env.DATABASE_PORT ?? 6543),
      user,
      password,
      database: process.env.DATABASE_NAME?.trim() ?? "postgres",
    });
  }

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Database not configured. Set DATABASE_HOST, DATABASE_USER, and DATABASE_PASSWORD in .env.local (recommended), or DATABASE_URL."
    );
  }

  return postgres(url, baseOptions);
}
