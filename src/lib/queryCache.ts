interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

export class QueryCache {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly pending = new Map<string, Promise<unknown>>();
  private readonly revisions = new Map<string, number>();
  private readonly now: () => number;
  private generation = 0;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  async get<T>(key: string, load: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = this.entries.get(key);
    if (cached && cached.expiresAt > this.now()) return cached.value as T;

    const inFlight = this.pending.get(key);
    if (inFlight) return inFlight as Promise<T>;

    const generation = this.generation;
    const revision = this.revisions.get(key) ?? 0;
    let request: Promise<T>;
    request = load()
      .then((value) => {
        if (
          generation === this.generation
          && revision === (this.revisions.get(key) ?? 0)
        ) {
          this.set(key, value, ttlMs);
        }
        return value;
      })
      .finally(() => {
        if (this.pending.get(key) === request) this.pending.delete(key);
      });
    this.pending.set(key, request);
    return request;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.entries.set(key, { value, expiresAt: this.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.entries.delete(key);
    this.pending.delete(key);
    this.revisions.set(key, (this.revisions.get(key) ?? 0) + 1);
  }

  invalidatePrefix(prefix: string): void {
    const keys = new Set([...this.entries.keys(), ...this.pending.keys()]);
    for (const key of keys) {
      if (key.startsWith(prefix)) this.invalidate(key);
    }
  }

  clear(): void {
    this.generation += 1;
    this.entries.clear();
    this.pending.clear();
    this.revisions.clear();
  }
}
