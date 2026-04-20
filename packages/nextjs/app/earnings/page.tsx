"use client";

import { useAppStore } from "@/lib/store";
import type { SubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

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

export default function EarningsPage() {
  const submissions = useAppStore((s) => s.submissions);

  const totalEarned = submissions.reduce(
    (s, x) => s + (x.status === "paid" ? x.amount : 0),
    0,
  );
  const totalPending = submissions.reduce(
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
      value: submissions.length.toString(),
      sub: "Bounties contributed to",
      highlight: false,
    },
  ];

  return (
    <div className="max-w-[700px] mx-auto px-6 py-10">
      <div className="mb-10">
        <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
          My earnings
        </div>
        <h1 className="font-display text-4xl font-medium text-foreground mb-2">
          Your submissions
        </h1>
        <p className="text-sm text-muted">
          Every study you&apos;ve contributed to, and the payment status of each.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-9">
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

      {submissions.length === 0 ? (
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
            No submissions yet
          </div>
          <div className="text-[13px] text-placeholder">
            Head to the marketplace to start earning.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {submissions.map((sub, i) => (
            <div
              key={`${sub.bountyId}-${i}`}
              className="flex items-center gap-4 px-5 py-4 rounded-[12px] bg-surface border border-border shadow-card"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
                  STATUS_ICON_BG[sub.status],
                )}
              >
                <StatusIcon status={sub.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground mb-0.5 truncate">
                  {sub.bountyTitle}
                </div>
                <div className="text-xs text-placeholder truncate">
                  {sub.org} · {sub.date}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className={cn(
                    "font-display text-lg font-medium",
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
          ))}
        </div>
      )}
    </div>
  );
}
