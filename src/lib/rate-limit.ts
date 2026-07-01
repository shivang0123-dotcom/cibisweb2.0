// Login attempt throttling. Uses the Vercel Runtime Cache when available (so
// it works across serverless instances) and falls back to in-memory state for
// local development — mirroring the approach in order-store.ts.

type Entry = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILURES = 5;

const globalForRateLimit = globalThis as typeof globalThis & {
  __circoloRateLimit?: Map<string, Entry>;
};

function getMemoryStore() {
  if (!globalForRateLimit.__circoloRateLimit) {
    globalForRateLimit.__circoloRateLimit = new Map<string, Entry>();
  }
  return globalForRateLimit.__circoloRateLimit;
}

async function getRuntimeCache() {
  try {
    const { getCache } = await import("@vercel/functions");
    return getCache({ namespace: "circolo-rate-limit" });
  } catch {
    return null;
  }
}

async function readEntry(key: string): Promise<Entry | undefined> {
  const cache = await getRuntimeCache();
  if (cache) {
    try {
      const cached = (await cache.get(key)) as Entry | undefined;
      if (cached) return cached;
    } catch {
      // fall through to memory
    }
  }
  return getMemoryStore().get(key);
}

async function writeEntry(key: string, entry: Entry) {
  getMemoryStore().set(key, entry);
  const cache = await getRuntimeCache();
  if (cache) {
    try {
      await cache.set(key, entry, {
        ttl: Math.ceil(WINDOW_MS / 1000),
        tags: ["rate-limit"],
        name: "circolo-rate-limit",
      });
    } catch {
      // memory keeps local dev working if the cache is unavailable
    }
  }
}

/** Returns whether this key is currently locked out. */
export async function checkRateLimit(
  key: string,
): Promise<{ blocked: boolean; retryAfterSec: number }> {
  const entry = await readEntry(key);
  const now = Date.now();

  if (!entry || now > entry.resetAt) {
    return { blocked: false, retryAfterSec: 0 };
  }

  return {
    blocked: entry.count >= MAX_FAILURES,
    retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/** Record a failed attempt, starting a new window if needed. */
export async function registerFailure(key: string) {
  const now = Date.now();
  const entry = await readEntry(key);

  if (!entry || now > entry.resetAt) {
    await writeEntry(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    await writeEntry(key, { count: entry.count + 1, resetAt: entry.resetAt });
  }
}

/** Clear the counter after a successful login. */
export async function clearFailures(key: string) {
  getMemoryStore().delete(key);
  // Best-effort reset in the shared cache (write an already-expired window).
  await writeEntry(key, { count: 0, resetAt: Date.now() - 1 });
}

/** Best-effort client identifier from proxy headers. */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}
