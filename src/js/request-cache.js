const STORAGE_KEY = 'bookshelf-api-cache-v1';
const COOLDOWN_KEY = 'bookshelf-api-cooldown-v1';
const TEN_MINUTES = 10 * 60 * 1000;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export class ServiceCooldownError extends Error {
  constructor(retryAfterMs) {
    super('The book service is temporarily limiting requests. Please try again in a minute.');
    this.retryAfterMs = retryAfterMs;
  }
}

// Share pending requests and retain successful responses across page navigation.
export function createRequestCache({ storage, now = Date.now, ttl = TEN_MINUTES, cooldownMs = 60000 } = {}) {
  let saved = {};
  let blockedUntil = 0;
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed;
    blockedUntil = Number(storage?.getItem(COOLDOWN_KEY)) || 0;
  } catch { /* A damaged cache must not prevent a live request. */ }
  const pending = new Map();

  function get(key, validate) {
    const entry = saved[key];
    if (!entry || !Number.isFinite(entry.at) || now() - entry.at > ONE_WEEK || now() < entry.at || !validate(entry.data)) return null;
    return entry;
  }
  function persist() {
    const entries = Object.entries(saved).sort((a, b) => b[1].at - a[1].at).slice(0, 100);
    saved = Object.fromEntries(entries);
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* Memory cache still works when storage is full or disabled. */ }
  }
  async function request(key, load, validate) {
    const cached = get(key, validate);
    if (cached && now() - cached.at < ttl) return { data: cached.data, stale: false, at: cached.at };
    if (pending.has(key)) return pending.get(key);
    if (blockedUntil > now()) {
      if (cached) return { data: cached.data, stale: true, at: cached.at };
      throw new ServiceCooldownError(blockedUntil - now());
    }
    const task = (async () => {
      try {
        const data = await Promise.resolve().then(load);
        if (!validate(data)) throw new Error('The book service returned invalid data.');
        const at = now();
        saved[key] = { data, at };
        persist();
        return { data, stale: false, at };
      } catch (error) {
        if (error?.response?.status === 429 || /\b429\b/.test(String(error?.response?.data?.message || ''))) {
          blockedUntil = now() + cooldownMs;
          try { storage?.setItem(COOLDOWN_KEY, String(blockedUntil)); } catch { /* Keep the in-memory cooldown. */ }
          if (!cached) throw new ServiceCooldownError(cooldownMs);
        }
        if (cached) return { data: cached.data, stale: true, at: cached.at };
        throw error;
      } finally { pending.delete(key); }
    })();
    pending.set(key, task);
    return task;
  }
  return { request, peek: get };
}
