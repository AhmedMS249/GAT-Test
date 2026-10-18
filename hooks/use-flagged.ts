"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "gat-flagged-v1";

function save(ids: Set<string>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
  } catch {
    /* storage unavailable (private mode / quota): flags simply won't persist */
  }
}

/** Flagged question ids, saved in this browser's localStorage. */
export function useFlagged() {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  // Read after mount so server and client render the same HTML first.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore corrupted or unavailable storage */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set<string>(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIds(() => {
      const next = new Set<string>();
      save(next);
      return next;
    });
  }, []);

  return { ids, toggle, clear };
}
