"use client";

import { useSyncExternalStore } from "react";

// Module-level cache: getSnapshot must be referentially stable between ticks,
// otherwise React detects "snapshot changed without subscribe firing" and bails
// with an infinite-loop error.
let snapshot = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function tick() {
  snapshot = Date.now();
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void): () => void {
  // First subscriber primes the snapshot; subsequent renders get the same value
  // until the next interval tick.
  if (snapshot === 0) snapshot = Date.now();
  listeners.add(callback);
  if (!intervalId) intervalId = setInterval(tick, 60_000);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot(): number {
  return snapshot;
}

function getServerSnapshot(): number {
  return 0;
}

/**
 * Reads the current timestamp without violating React purity rules.
 * Returns 0 on the server (and on first render) so SSR/CSR stay deterministic;
 * after hydration the value updates roughly once a minute.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
