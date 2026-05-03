"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAppStore } from "@/lib/store";
import type { Submission, SubmissionStatus } from "@/lib/types";
import { useNow } from "@/hooks/useNow";
import {
  arbiscanTx,
  cn,
  truncateAddress,
  truncateHash,
} from "@/lib/utils";

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  paid: "text-accent",
  pending: "text-[#d97706]",
  rejected: "text-[#ef4444]",
};

const STATUS_ICON_BG: Record<SubmissionStatus, string> = {
  paid: "bg-accent-light",
  pending: "bg-status-filling-bg",
  rejected: "bg-status-error-bg",
};

type StatusFilter = "all" | SubmissionStatus;
type TimeRange = "all" | "7d" | "30d" | "90d";

const STATUS_OPTIONS: [StatusFilter, string][] = [
  ["all", "All"],
  ["paid", "Paid"],
  ["pending", "Pending"],
  ["rejected", "Rejected"],
];

const RANGE_OPTIONS: [TimeRange, string][] = [
  ["all", "All time"],
  ["7d", "7 days"],
  ["30d", "30 days"],
  ["90d", "90 days"],
];

function StatusIcon({ status }: { status: SubmissionStatus }) {
  if (status === "paid") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M4 9l3.5 3.5L14 5"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "pending") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle
          cx="9"
          cy="9"
          r="7"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeDasharray="14 10"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M6 6l6 6M12 6l-6 6"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function rangeMs(r: TimeRange): number {
  if (r === "7d") return 7 * 86400000;
  if (r === "30d") return 30 * 86400000;
  if (r === "90d") return 90 * 86400000;
  return Infinity;
}

function toCsv(rows: Submission[]): string {
  const header = [
    "date",
    "bounty",
    "org",
    "amount_usdc",
    "status",
    "tx_hash",
    "ciphertext_hash",
    "wallet",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.date,
        `"${r.bountyTitle.replace(/"/g, '""')}"`,
        `"${r.org.replace(/"/g, '""')}"`,
        r.amount.toFixed(2),
        r.status,
        r.txHash ?? "",
        r.ciphertextHash ?? "",
        r.walletAddress,
      ].join(","),
    );
  }
  return lines.join("\n");
}

function downloadCsv(rows: Submission[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medyield-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function EarningsPage() {
  const { address, isConnected } = useAccount();
  const submissions = useAppStore((s) =>
    address ? s.submissionsByWallet[address.toLowerCase()] ?? [] : [],
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [range, setRange] = useState<TimeRange>("all");
  const [refreshing, setRefreshing] = useState(false);
  const now = useNow();

  const filtered = useMemo(() => {
    const cutoff = now > 0 ? now - rangeMs(range) : 0;
    const q = search.toLowerCase();
    return submissions.filter((s) => {
      if (range !== "all" && s.timestamp < cutoff) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (
        q &&
        !s.bountyTitle.toLowerCase().includes(q) &&
        !s.org.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [submissions, search, statusFilter, range, now]);

  const totalEarned = filtered.reduce(
    (s, x) => s + (x.status === "paid" ? x.amount : 0),
    0,
  );
  const totalPending = filtered.reduce(
    (s, x) => s + (x.status === "pending" ? x.amount : 0),
    0,
  );

  const cards = [
    {
      label: "Total earned",
      value: `$${totalEarned.toFixed(2)}`,
      sub: "USDC received",
      highlight: true,
    },
    {
      label: "Pending",
      value: `$${totalPending.toFixed(2)}`,
      sub: "Awaiting validation",
      highlight: false,
    },
    {
      label: "Submissions",
      value: filtered.length.toString(),
      sub: "Bounties contributed to",
      highlight: false,
    },
  ];

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  if (!isConnected) {
    return (
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
          My earnings
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-2">
          Connect to view your earnings
        </h1>
        <p className="text-sm text-muted mb-7 leading-[1.7]">
          Earnings are tied to the wallet that signed the submission. Connect
          the wallet you submitted from to see history, tx hashes, and pending
          payouts.
        </p>
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={openConnectModal}
              className="px-7 py-[13px] rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity tracking-wide"
            >
              Connect wallet →
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    );
  }

  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8 sm:mb-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
            My earnings
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-2">
            Your submissions
          </h1>
          <p className="text-sm text-muted">
            Wallet{" "}
            <span className="font-mono text-foreground-soft">
              {address ? truncateAddress(address) : ""}
            </span>{" "}
            · {submissions.length} total
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={refresh}
            className="px-3 py-2 rounded-lg border-[1.5px] border-border text-[12px] text-muted hover:border-accent hover:text-accent transition-colors flex items-center gap-1.5"
          >
            <span className={cn("inline-block", refreshing && "animate-spin-slow")}>
              ↻
            </span>
            Refresh
          </button>
          <button
            onClick={() => downloadCsv(filtered)}
            disabled={filtered.length === 0}
            className="px-3 py-2 rounded-lg border-[1.5px] border-border text-[12px] text-muted hover:border-accent hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-7">
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "px-5 py-[18px] rounded-[14px]",
              card.highlight
                ? "bg-accent-light border border-transparent"
                : "bg-surface border border-border shadow-card",
            )}
          >
            <div
              className={cn(
                "font-display text-[28px] font-medium",
                card.highlight ? "text-accent" : "text-foreground",
              )}
            >
              {card.value}
            </div>
            <div className="text-[11px] text-muted mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by bounty or org…"
          className="flex-1 min-w-full sm:min-w-[200px] px-3 py-2 rounded-[10px] border border-border bg-surface text-[13px] text-foreground outline-none focus:border-accent transition-colors"
        />
        <div className="flex gap-[2px] bg-surface-subtle rounded-lg p-[3px] overflow-x-auto">
          {STATUS_OPTIONS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs transition-all whitespace-nowrap",
                statusFilter === val
                  ? "bg-surface text-foreground font-semibold shadow-[0_1px_3px_rgba(28,25,23,0.08)]"
                  : "text-placeholder hover:text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-[2px] bg-surface-subtle rounded-lg p-[3px] overflow-x-auto">
          {RANGE_OPTIONS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setRange(val)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs transition-all whitespace-nowrap",
                range === val
                  ? "bg-surface text-foreground font-semibold shadow-[0_1px_3px_rgba(28,25,23,0.08)]"
                  : "text-placeholder hover:text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState all={submissions.length === 0} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((sub, i) => (
            <SubmissionRow key={`${sub.bountyId}-${i}`} sub={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ sub }: { sub: Submission }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 rounded-[12px] bg-surface border border-border shadow-card">
      <div
        className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 flex items-center justify-center",
          STATUS_ICON_BG[sub.status],
        )}
      >
        <StatusIcon status={sub.status} />
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/marketplace/${sub.bountyId}`}
          className="text-sm font-semibold text-foreground mb-0.5 truncate hover:text-accent transition-colors block"
        >
          {sub.bountyTitle}
        </Link>
        <div className="text-xs text-placeholder truncate">
          {sub.org} · {sub.date}
        </div>
        {sub.status === "rejected" && sub.rejectionReason && (
          <div className="text-[11px] text-[#991b1b] mt-1 leading-[1.4]">
            ⚠ {sub.rejectionReason}
          </div>
        )}
        {sub.status === "pending" && (
          <div className="text-[11px] text-[#92400e] mt-1">
            Network is range-checking your ciphertext — usually under a minute.
          </div>
        )}
        {sub.txHash && (
          <a
            href={arbiscanTx(sub.txHash)}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-mono text-accent hover:underline mt-1 inline-block"
          >
            {truncateHash(sub.txHash, 8, 6)} ↗
          </a>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <div
          className={cn(
            "font-display text-base sm:text-lg font-medium",
            STATUS_COLORS[sub.status],
          )}
        >
          {sub.status === "rejected" ? "—" : `$${sub.amount.toFixed(2)}`}
        </div>
        <div
          className={cn(
            "text-[10px] font-bold tracking-wider uppercase mt-0.5",
            STATUS_COLORS[sub.status],
          )}
        >
          {sub.status}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ all }: { all: boolean }) {
  return (
    <div className="text-center py-16">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        className="mx-auto opacity-30 mb-3"
      >
        <rect
          x="8"
          y="14"
          width="32"
          height="26"
          rx="4"
          stroke="#1c1917"
          strokeWidth="2"
        />
        <path
          d="M16 14V12a8 8 0 0116 0v2"
          stroke="#1c1917"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="28" r="3" fill="#1c1917" />
      </svg>
      <div className="font-display text-xl text-foreground-soft mb-1.5">
        {all ? "No submissions yet" : "No submissions match these filters"}
      </div>
      <div className="text-[13px] text-placeholder mb-4">
        {all
          ? "Head to the marketplace to start earning."
          : "Try clearing a filter to see more."}
      </div>
      {all && (
        <Link
          href="/marketplace"
          className="inline-block px-5 py-2.5 rounded-lg bg-accent text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
        >
          Browse bounties →
        </Link>
      )}
    </div>
  );
}
