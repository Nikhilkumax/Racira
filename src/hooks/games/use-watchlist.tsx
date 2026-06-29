import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "racira:watchlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSlugs(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: string[]) => {
    setSlugs(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const isSaved = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggle = useCallback(
    (slug: string) => {
      const next = slugs.includes(slug)
        ? slugs.filter((s) => s !== slug)
        : [...slugs, slug];
      persist(next);
      return next.includes(slug);
    },
    [slugs, persist],
  );

  return { slugs, isSaved, toggle };
}
