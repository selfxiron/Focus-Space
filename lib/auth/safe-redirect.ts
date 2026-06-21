/** Only allow same-origin relative paths (blocks open redirects). */
export function safeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  if (next.includes("\\") || next.includes(":")) {
    return "/";
  }

  return next;
}
