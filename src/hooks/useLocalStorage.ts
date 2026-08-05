"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch { /* ignore */ }
    setMounted(true);
  }, [key]);

  // Gated on `mounted` so the initial value never overwrites stored data before the read lands.
  useEffect(() => {
    if (!mounted) return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }, [key, value, mounted]);

  return [value, setValue];
}
