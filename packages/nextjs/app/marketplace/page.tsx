"use client";

import { useMemo, useState } from "react";
import { BOUNTIES } from "@/lib/bounties";
import type { Bounty } from "@/lib/types";
import { BountyCard } from "@/components/marketplace/BountyCard";
import { SubmitDrawer } from "@/components/submit/SubmitDrawer";
import { cn } from "@/lib/utils";

type SortKey = "payout" | "deadline" | "activity";
type Layout = "grid" | "list";

const SORT_OPTIONS: [SortKey, string][] = [
  ["payout", "Highest pay"],
  ["deadline", "Closing soon"],
  ["activity", "Most active"],
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("payout");
  const [layout, setLayout] = useState<Layout>("grid");
  const [selected, setSelected] = useState<Bounty | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return BOUNTIES.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.org.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q),
    ).sort((a, b) => {
      if (sort === "payout") return b.pricePerRecord - a.pricePerRecord;
      if (sort === "deadline") return a.deadline - b.deadline;
      return b.validatedSubmissions - a.validatedSubmissions;
    });
  }, [search, sort]);

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="mb-12 max-w-[560px]">
          <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
            Open bounties
          </div>
          <h1 className="font-display text-[40px] font-medium text-foreground leading-[1.2] mb-3.5">
            Earn from your health data.
            <br />
            Keep it encrypted. Always.
          </h1>
          <p className="text-[15px] text-muted leading-[1.7]">
            Submit to any study below. Your data is encrypted in your browser
            before it reaches the blockchain — researchers only ever see
            aggregate results.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex gap-3 mb-8 items-center flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bounties…"
              className="w-full pl-9 pr-3 py-2.5 rounded-[10px] border border-border bg-surface text-[13px] text-foreground outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex gap-[2px] bg-surface-subtle rounded-lg p-[3px]">
            {SORT_OPTIONS.map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSort(val)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs transition-all",
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
                onClick={() => setLayout(val)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs capitalize transition-all",
                  layout === val
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

        {layout === "list" ? (
          <div className="flex flex-col gap-3">
            {filtered.map((b) => (
              <BountyCard key={b.id} bounty={b} layout="list" onSelect={setSelected} />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
            {filtered.map((b) => (
              <BountyCard key={b.id} bounty={b} layout="grid" onSelect={setSelected} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-placeholder">
            No bounties match your search.
          </div>
        )}
      </div>

      <SubmitDrawer
        bounty={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
