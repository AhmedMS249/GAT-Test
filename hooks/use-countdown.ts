"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts down from `seconds` while `running` is true. Uses wall-clock time, so
 * it stays accurate even if the browser throttles timers in a background tab.
 * `onExpire` always calls the latest callback passed in (no stale closures).
 * Mount it with a `key` per question to reset it.
 */
export function useCountdown(seconds: number, running: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!running) return;
    const end = Date.now() + seconds * 1000;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        onExpireRef.current();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running, seconds]);

  return remaining;
}
