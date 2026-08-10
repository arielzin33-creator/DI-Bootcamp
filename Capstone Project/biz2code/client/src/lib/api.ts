/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Fetch wrapper. ALWAYS sends credentials.
 * WHY       The JWT lives in an httpOnly cookie, so every request needs credentials:'include'. Forgetting this is the single most common cause of mystery 401s.
 * NOTE      Uses a RELATIVE base ('/api'). Vite proxies it to :3001, so the
 *           browser sees a single origin and the cookie is same-site in dev.
 *           Do not hardcode http://localhost:3001 here — that reintroduces the
 *           cross-origin cookie problem the proxy was added to remove.
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Throw a typed ApiError on non-2xx
 *   [ ] Base URL from import.meta.env
 */

const BASE = import.meta.env.VITE_API_URL ?? '/api';   // proxied by Vite in dev

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',                       // required — cookie auth
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
  return res.json() as Promise<T>;
}
