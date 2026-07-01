export type WaiterCall = {
  id: string;
  tableNumber: number;
  createdAt: string;
  status: "pending" | "resolved";
};

type CallStoreState = { calls: WaiterCall[] };

const globalForCalls = globalThis as typeof globalThis & {
  __circoloCallStore?: CallStoreState;
};

const cacheKey = "calls-v1";
const ttlSeconds = 60 * 60 * 12;
const maxAgeMs = 1000 * 60 * 30; // drop unanswered calls after 30 minutes

function getMemory(): CallStoreState {
  if (!globalForCalls.__circoloCallStore) {
    globalForCalls.__circoloCallStore = { calls: [] };
  }
  return globalForCalls.__circoloCallStore;
}

async function getRuntimeCache() {
  try {
    const { getCache } = await import("@vercel/functions");
    return getCache({ namespace: "circolo-calls" });
  } catch {
    return null;
  }
}

async function readStore(): Promise<CallStoreState> {
  const memory = getMemory();
  const cache = await getRuntimeCache();

  if (!cache) return memory;

  try {
    const cached = (await cache.get(cacheKey)) as CallStoreState | undefined;
    if (cached) {
      globalForCalls.__circoloCallStore = { calls: cached.calls ?? [] };
      return globalForCalls.__circoloCallStore;
    }
    await cache.set(cacheKey, memory, { ttl: ttlSeconds, tags: ["calls"], name: "circolo-call-state" });
  } catch {
    return memory;
  }

  return memory;
}

async function writeStore(state: CallStoreState) {
  globalForCalls.__circoloCallStore = state;
  const cache = await getRuntimeCache();

  if (!cache) return;

  try {
    await cache.set(cacheKey, state, { ttl: ttlSeconds, tags: ["calls"], name: "circolo-call-state" });
  } catch {
    // In-memory still serves local development if Runtime Cache is unavailable.
  }
}

function prune(calls: WaiterCall[]): WaiterCall[] {
  const cutoff = Date.now() - maxAgeMs;
  return calls.filter((call) => new Date(call.createdAt).getTime() > cutoff).slice(-50);
}

export async function createCall(tableNumber: number): Promise<WaiterCall> {
  const store = await readStore();
  const pruned = prune(store.calls);

  // Avoid stacking duplicate requests from the same table.
  const existing = pruned.find((call) => call.tableNumber === tableNumber);
  if (existing) {
    store.calls = pruned;
    await writeStore(store);
    return existing;
  }

  const call: WaiterCall = {
    id: `call-${crypto.randomUUID()}`,
    tableNumber,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  store.calls = [...pruned, call];
  await writeStore(store);
  return call;
}

export async function listCalls(): Promise<WaiterCall[]> {
  const store = await readStore();
  const pruned = prune(store.calls);
  if (pruned.length !== store.calls.length) {
    store.calls = pruned;
    await writeStore(store);
  }
  return [...pruned].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function resolveCall(id: string): Promise<WaiterCall | null> {
  const store = await readStore();
  const call = store.calls.find((item) => item.id === id) ?? null;
  store.calls = store.calls.filter((item) => item.id !== id);
  await writeStore(store);
  return call ? { ...call, status: "resolved" } : null;
}
