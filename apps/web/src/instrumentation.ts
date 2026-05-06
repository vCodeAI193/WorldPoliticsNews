export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Next.js 15 starts Node with --localstorage-file but without a valid path,
    // resulting in a global `localStorage = {}` where getItem is not a function.
    // Patch it with a no-op in-memory implementation so SSR doesn't crash.
    const ls = globalThis.localStorage as unknown;
    if (!ls || typeof (ls as Storage).getItem !== 'function') {
      const store: Record<string, string> = {};
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: (k: string) => store[k] ?? null,
          setItem: (k: string, v: string) => { store[k] = v; },
          removeItem: (k: string) => { delete store[k]; },
          clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
          get length() { return Object.keys(store).length; },
          key: (i: number) => Object.keys(store)[i] ?? null,
        } satisfies Storage,
        writable: true,
        configurable: true,
      });
    }
  }
}
