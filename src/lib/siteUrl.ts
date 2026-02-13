// src/lib/siteUrl.ts
function trimTrailingSlash(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export function siteUrl(path = ""): string {
  const p = path ? (path.startsWith("/") ? path : `/${path}`) : "/";

  // Prioridad: env explícita (sirve para prod + staging + preview)
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.NODE_ENV === "production" ? "https://elvascox.com" : "http://localhost:3000");

  return `${trimTrailingSlash(base)}${p}`;
}
