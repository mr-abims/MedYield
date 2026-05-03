"use client";

import Link from "next/link";
import type { Bounty } from "@/lib/types";
import { formatDeadline } from "@/lib/utils";
import { useNow } from "@/hooks/useNow";
import { StatusBadge } from "./StatusBadge";
import { FieldPill, VerifiedIcon } from "./FieldPill";

interface BountyCardProps {
  bounty: Bounty;
  layout: "grid" | "list";
  alreadySubmitted?: boolean;
}

export function BountyCard({
  bounty,
  layout,
  alreadySubmitted,
}: BountyCardProps) {
  const now = useNow();
  const fillPct = Math.round((bounty.escrowUsed / bounty.escrow) * 100);
  const expired = now > 0 && bounty.deadline <= now;
  const slotsLeft = bounty.maxSubmissions - bounty.validatedSubmissions;
  const slotsFew = !expired && slotsLeft > 0 && slotsLeft <= 25;
  const isOpen = bounty.status === "OPEN" && !expired && slotsLeft > 0;

  const ctaLabel = alreadySubmitted
    ? "Already contributed ✓"
    : expired
      ? "Bounty closed"
      : !isOpen
        ? "View details"
        : "Submit my data";

  const detailHref = `/marketplace/${bounty.id}`;

  if (layout === "list") {
    return (
      <Link
        href={detailHref}
        className="block bg-surface rounded-[14px] border border-border px-5 sm:px-7 py-5 sm:py-[22px] flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7 cursor-pointer shadow-card hover:shadow-card-hover hover:-translate-y-[1px] transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-muted">{bounty.org}</span>
            {bounty.verified && <VerifiedIcon />}
            <StatusBadge status={bounty.status} fillPct={fillPct} />
            {alreadySubmitted && <SubmittedBadge />}
            {slotsFew && <SlotsLeftBadge n={slotsLeft} />}
          </div>
          <div className="font-display text-lg font-medium text-foreground mb-1">
            {bounty.title}
          </div>
          <p className="text-[13px] text-muted mb-2 leading-[1.5]">
            {bounty.description}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {bounty.fields.map((f) => (
              <FieldPill key={f.name} field={f} />
            ))}
          </div>
        </div>
        <div className="flex sm:flex-col sm:items-end items-center gap-3 sm:min-w-[160px] justify-between">
          <div className="text-left sm:text-right">
            <div className="font-display text-xl sm:text-2xl font-semibold text-accent">
              ${bounty.pricePerRecord.toFixed(2)}
            </div>
            <div className="text-[11px] text-placeholder">per record · USDC</div>
          </div>
          <div className="hidden sm:block w-40">
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-placeholder">{fillPct}% filled</span>
              <span className="text-[11px] text-placeholder">
                {formatDeadline(bounty.deadline)}
              </span>
            </div>
            <div className="h-1 bg-surface-subtle rounded-sm">
              <div
                className="h-full bg-accent rounded-sm transition-all duration-500"
                style={{ width: `${Math.min(fillPct, 100)}%` }}
              />
            </div>
          </div>
          <CtaButton label={ctaLabel} disabled={alreadySubmitted || !isOpen} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={detailHref}
      className="bg-surface rounded-[18px] border border-border p-5 sm:p-6 cursor-pointer flex flex-col shadow-card hover:shadow-card-hover hover:-translate-y-[2px] transition-all"
    >
      <div className="flex justify-between items-start mb-3.5">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-xs font-semibold text-muted">{bounty.org}</span>
            {bounty.verified && <VerifiedIcon />}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={bounty.status} fillPct={fillPct} />
            {alreadySubmitted && <SubmittedBadge />}
            {slotsFew && <SlotsLeftBadge n={slotsLeft} />}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-[22px] font-semibold text-accent leading-none">
            ${bounty.pricePerRecord.toFixed(2)}
          </div>
          <div className="text-[10px] text-placeholder mt-0.5">per record</div>
        </div>
      </div>

      <div className="font-display text-[18px] sm:text-[19px] font-medium text-foreground leading-tight mb-2">
        {bounty.title}
      </div>
      <p className="text-[13px] text-muted leading-[1.55] mb-3.5 flex-1">
        {bounty.description}
      </p>

      <div className="flex gap-1.5 flex-wrap mb-4">
        {bounty.fields.map((f) => (
          <FieldPill key={f.name} field={f} />
        ))}
      </div>

      <div className="px-3.5 py-3 rounded-[10px] bg-accent-light mb-4">
        <div className="text-[11px] font-semibold text-accent mb-0.5 tracking-wide">
          PRIVACY GUARANTEE
        </div>
        <p className="text-xs text-foreground-soft leading-[1.5]">
          {bounty.computeDescription}
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] text-placeholder">
            {bounty.validatedSubmissions.toLocaleString()} validated
          </span>
          <span className="text-[11px] text-placeholder">
            {formatDeadline(bounty.deadline)}
          </span>
        </div>
        <div className="h-[5px] bg-surface-subtle rounded-[3px]">
          <div
            className="h-full bg-accent rounded-[3px]"
            style={{ width: `${Math.min(fillPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-faint">{fillPct}% of escrow used</span>
          <span className="text-[10px] text-faint">
            ${(bounty.escrow - bounty.escrowUsed).toLocaleString()} remaining
          </span>
        </div>
      </div>

      <CtaButton
        label={ctaLabel}
        disabled={alreadySubmitted || !isOpen}
        full
      />
    </Link>
  );
}

function CtaButton({
  label,
  disabled,
  full,
}: {
  label: string;
  disabled?: boolean;
  full?: boolean;
}) {
  return (
    <span
      className={`${
        full ? "w-full" : "px-[18px]"
      } py-[10px] sm:py-[11px] rounded-[10px] text-[13px] font-semibold tracking-wide text-center transition-opacity ${
        disabled
          ? "bg-surface-subtle text-muted cursor-not-allowed"
          : "bg-accent text-white hover:opacity-90"
      }`}
    >
      {label}
      {!disabled && " →"}
    </span>
  );
}

function SubmittedBadge() {
  return (
    <span className="px-2 py-[3px] rounded-pill bg-accent-light text-accent text-[10px] font-bold tracking-[0.06em]">
      SUBMITTED
    </span>
  );
}

function SlotsLeftBadge({ n }: { n: number }) {
  return (
    <span className="px-2 py-[3px] rounded-pill bg-status-filling-bg text-status-filling-fg text-[10px] font-bold tracking-[0.06em]">
      {n} {n === 1 ? "SLOT" : "SLOTS"} LEFT
    </span>
  );
}
