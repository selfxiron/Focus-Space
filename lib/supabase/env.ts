/**
 * Validates Supabase env vars and returns trimmed values.
 * Throws with a clear message when the dashboard URL is pasted by mistake.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  if (url.includes("supabase.com/dashboard")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is a dashboard link, not your API URL. Use Project Settings → API → Project URL (https://<project-ref>.supabase.co)."
    );
  }

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must look like https://<project-ref>.supabase.co"
    );
  }

  return { url, key };
}
