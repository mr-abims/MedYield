"use client";

import type { Bounty } from "@/lib/types";
import { formatDeadline } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { FieldPill, VerifiedIcon } from "./FieldPill";

interface BountyCardProps {
  bounty: Bounty;
  layout: "grid" | "list";
  onSelect: (b: Bounty) => void;
}

export function BountyCard({ bounty, layout, onSelect }: BountyCardProps) {
  const fillPct = Math.round((bounty.escrowUsed / bounty.escrow) * 100);

  if (layout === "list") {
    return (
      <div
        onClick={() => onSelect(bounty)}
        className="bg-surface rounded-[14px] border border-border px-7 py-[22px] flex items-center gap-7 cursor-pointer shadow-card hover:shadow-card-hover hover:-translate-y-[1px] transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-muted">{bounty.org}</span>
            {bounty.verified && <VerifiedIcon />}
            <StatusBadge status={bounty.status} fillPct={fillPct} />
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
        <div className="flex flex-col items-end gap-3 min-w-[160px]">
          <div className="text-right">
            <div className="font-display text-2xl font-semibold text-accent">
              ${bounty.pricePerRecord.toFixed(2)}
            </div>
            <div className="text-[11px] text-placeholder">per record · USDC</div>
          </div>
          <div className="w-40">
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(bounty);
            }}
            className="px-[18px] py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
          >
            Submit my data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(bounty)}
      className="bg-surface rounded-[18px] border border-border p-6 cursor-pointer flex flex-col shadow-card hover:shadow-card-hover hover:-translate-y-[2px] transition-all"
    >
      <div className="flex justify-between items-start mb-3.5">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-semibold text-muted">{bounty.org}</span>
            {bounty.verified && <VerifiedIcon />}
          </div>
          <StatusBadge status={bounty.status} fillPct={fillPct} />
        </div>
        <div className="text-right">
          <div className="font-display text-[22px] font-semibold text-accent leading-none">
            ${bounty.pricePerRecord.toFixed(2)}
          </div>
          <div className="text-[10px] text-placeholder mt-0.5">per record</div>
        </div>
      </div>

      <div className="font-display text-[19px] font-medium text-foreground leading-tight mb-2">
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

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(bounty);
        }}
        className="w-full py-[11px] rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity tracking-wide"
      >
        Submit my data →
      </button>
    </div>
  );
}
