"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SortKey = "payout" | "deadline" | "activity";
export type Layout = "grid" | "list";

export interface MarketplaceUrlState {
  q: string;
  sort: SortKey;
  view: Layout;
  setQ: (q: string) => void;
  setSort: (s: SortKey) => void;
  setView: (v: Layout) => void;
}

const SORT_VALUES: SortKey[] = ["payout", "deadline", "activity"];
const LAYOUT_VALUES: Layout[] = ["grid", "list"];

export function useMarketplaceUrlState(): MarketplaceUrlState {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const sortRaw = params.get("sort") as SortKey | null;
  const viewRaw = params.get("view") as Layout | null;
  const sort: SortKey = sortRaw && SORT_VALUES.includes(sortRaw) ? sortRaw : "payout";
  const view: Layout =
    viewRaw && LAYOUT_VALUES.includes(viewRaw) ? viewRaw : "grid";

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, val] of Object.entries(patch)) {
        if (!val) next.delete(key);
        else next.set(key, val);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return useMemo(
    () => ({
      q,
      sort,
      view,
      setQ: (val) => update({ q: val || undefined }),
      setSort: (val) => update({ sort: val === "payout" ? undefined : val }),
      setView: (val) => update({ view: val === "grid" ? undefined : val }),
    }),
    [q, sort, view, update],
  );
}
