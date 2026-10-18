"use client";

import { useCallback, useEffect, useState } from "react";

/** A string choice remembered in localStorage (read after mount to avoid hydration mismatches). */
export function usePersistentChoice<T extends string>(key: string, initial: T, allowed: readonly T[]) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored && (allowed as readonly string[]).includes(stored)) setValue(stored as T);
    } catch {
      /* ignore */
    }
  }, [key, allowed]);

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, next);
      } catch {
        /* ignore */
      }
    },
    [key]
  );

  return [value, set] as const;
}
