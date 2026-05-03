"use client";

import { Suspense, useMemo } from "react";
import { useAccount } from "wagmi";
import { BOUNTIES } from "@/lib/bounties";
import type { Bounty } from "@/lib/types";
import { BountyCard } from "@/components/marketplace/BountyCard";
import { useAppStore } from "@/lib/store";
import {
  useMarketplaceUrlState,
  type Layout,
  type SortKey,
} from "@/hooks/useMarketplaceUrlState";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: [SortKey, string][] = [
  ["payout", "Highest pay"],
  ["deadline", "Closing soon"],
  ["activity", "Most active"],
];

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplaceInner />
    </Suspense>
  );
}

function MarketplaceInner() {
  const { q, sort, view, setQ, setSort, setView } = useMarketplaceUrlState();
  const { address } = useAccount();
  const customBounties = useAppStore((s) => s.customBounties);
  const submissions = useAppStore((s) =>
    address ? s.submissionsByWallet[address.toLowerCase()] ?? [] : [],
  );

  const submittedIds = useMemo(
    () => new Set(submissions.map((s) => s.bountyId)),
    [submissions],
  );

  const all = useMemo(() => [...customBounties, ...BOUNTIES], [customBounties]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return all
      .filter(
        (b) =>
          b.title.toLowerCase().includes(ql) ||
          b.org.toLowerCase().includes(ql) ||
          b.description.toLowerCase().includes(ql),
      )
      .sort((a, b) => {
        if (sort === "payout") return b.pricePerRecord - a.pricePerRecord;
        if (sort === "deadline") return a.deadline - b.deadline;
        return b.validatedSubmissions - a.validatedSubmissions;
      });
  }, [all, q, sort]);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8 sm:mb-12 max-w-[560px]">
        <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
          Open bounties
        </div>
        <h1 className="font-display text-[32px] sm:text-[40px] font-medium text-foreground leading-[1.2] mb-3.5">
          Earn from your health data.
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          Keep it encrypted. Always.
        </h1>
        <p className="text-[14px] sm:text-[15px] text-muted leading-[1.7]">
          Submit to any study below. Your data is encrypted in your browser
          before it reaches the blockchain — researchers only ever see
          aggregate results.
        </p>
      </div>

      <FilterBar
        q={q}
        sort={sort}
        view={view}
        onQ={setQ}
        onSort={setSort}
        onView={setView}
      />

      {filtered.length === 0 ? (
        <EmptyState onClear={() => setQ("")} hadQuery={!!q} />
      ) : view === "list" ? (
        <div className="flex flex-col gap-3">
          {filtered.map((b) => (
            <BountyCard
              key={b.id}
              bounty={b}
              layout="list"
              alreadySubmitted={submittedIds.has(b.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {filtered.map((b) => (
            <BountyCard
              key={b.id}
              bounty={b}
              layout="grid"
              alreadySubmitted={submittedIds.has(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterBarProps {
  q: string;
  sort: SortKey;
  view: Layout;
  onQ: (s: string) => void;
  onSort: (s: SortKey) => void;
  onView: (v: Layout) => void;
}

function FilterBar({ q, sort, view, onQ, onSort, onView }: FilterBarProps) {
  return (
    <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 items-stretch sm:items-center flex-wrap">
      <div className="flex-1 min-w-full sm:min-w-[200px] relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="#1c1917" strokeWidth="1.5" />
          <path
            d="M10.5 10.5L14 14"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search bounties…"
          className="w-full pl-9 pr-9 py-2.5 rounded-[10px] border border-border bg-surface text-[13px] text-foreground outline-none focus:border-accent transition-colors"
        />
        {q && (
          <button
            onClick={() => onQ("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-placeholder hover:text-foreground hover:bg-surface-subtle transition-colors flex items-center justify-center text-base"
          >
            ×
          </button>
        )}
      </div>
      <div className="flex gap-[2px] bg-surface-subtle rounded-lg p-[3px] overflow-x-auto">
        {SORT_OPTIONS.map(([val, label]) => (
          <button
            key={val}
            onClick={() => onSort(val)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs transition-all whitespace-nowrap",
              sort === val
                ? "bg-surface text-foreground font-semibold shadow-[0_1px_3px_rgba(28,25,23,0.08)]"
                : "text-placeholder font-normal hover:text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-[2px] bg-surface-subtle rounded-lg p-[3px]">
        {(["grid", "list"] as const).map((val) => (
          <button
            key={val}
            onClick={() => onView(val)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs capitalize transition-all",
              view === val
                ? "bg-surface text-foreground font-semibold shadow-[0_1px_3px_rgba(28,25,23,0.08)]"
                : "text-placeholder hover:text-muted",
            )}
            aria-label={`${val} layout`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  hadQuery,
  onClear,
}: {
  hadQuery: boolean;
  onClear: () => void;
}) {
  return (
    <div className="text-center py-16">
      <div className="font-display text-xl text-foreground-soft mb-1.5">
        No bounties match your search.
      </div>
      <div className="text-[13px] text-placeholder mb-4">
        {hadQuery
          ? "Try a different keyword or clear the filter."
          : "Check back soon — researchers post new bounties weekly."}
      </div>
      {hadQuery && (
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-lg border-[1.5px] border-border text-sm text-muted hover:border-accent hover:text-accent transition-colors"
        >
          Clear search
        </button>
      )}
    </div>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10">
      <div className="h-8 w-40 rounded-md bg-surface-subtle animate-pulse mb-3" />
      <div className="h-12 w-3/4 rounded-md bg-surface-subtle animate-pulse mb-10" />
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[320px] rounded-[18px] bg-surface-subtle animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export type { Bounty };
